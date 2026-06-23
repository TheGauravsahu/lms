import express from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { verifyToken, verifyRoles } from "../middleware/auth.js";
import { StudyGroup, GroupMessage } from "./model.js";
import { accountModel } from "../auth/model.js";
import crypto from "crypto";

const r = express.Router();
r.use(verifyToken);

// GET /api/study-groups?courseId=&page=1&limit=20
r.get(
  "/",
  asyncHandler(async (req, res) => {
    const { courseId, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (courseId) filter.courseId = courseId;

    const skip = (Number(page) - 1) * Number(limit);
    const [groups, total] = await Promise.all([
      StudyGroup.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .populate("createdBy", "name email")
        .populate("courseId", "title")
        .populate("members", "name email"),
      StudyGroup.countDocuments(filter),
    ]);

    res.success(200, { groups, total }, "Study groups fetched.");
  })
);

// GET /api/study-groups/my — groups the current user is in
r.get(
  "/my",
  asyncHandler(async (req, res) => {
    const userId = req.account.account_id;
    const groups = await StudyGroup.find({ members: userId })
      .populate("createdBy", "name email")
      .populate("courseId", "title")
      .populate("members", "name email");
    res.success(200, groups, "My study groups fetched.");
  })
);

// GET /api/study-groups/:groupId
r.get(
  "/:groupId",
  asyncHandler(async (req, res) => {
    const group = await StudyGroup.findById(req.params.groupId)
      .populate("createdBy", "name email xp badges")
      .populate("courseId", "title")
      .populate("members", "name email xp badges");

    if (!group) return res.error(404, "Not Found", "Study group not found.");
    res.success(200, group, "Study group fetched.");
  })
);

// POST /api/study-groups — create group
r.post(
  "/",
  asyncHandler(async (req, res) => {
    const { name, description, courseId, isPrivate, maxMembers } = req.body;
    if (!name) return res.error(400, "Validation Error", "name is required.");

    const userId = req.account.account_id;
    const inviteCode = isPrivate
      ? crypto.randomBytes(4).toString("hex").toUpperCase()
      : undefined;

    const group = await StudyGroup.create({
      name,
      description,
      courseId: courseId || undefined,
      createdBy: userId,
      members: [userId],
      isPrivate: !!isPrivate,
      inviteCode,
      maxMembers: maxMembers || 20,
    });

    await group.populate("createdBy", "name email");
    res.success(201, group, "Study group created.");
  })
);

// POST /api/study-groups/:groupId/join — join group
r.post(
  "/:groupId/join",
  asyncHandler(async (req, res) => {
    const { groupId } = req.params;
    const { inviteCode } = req.body;
    const userId = req.account.account_id;

    const group = await StudyGroup.findById(groupId);
    if (!group) return res.error(404, "Not Found", "Group not found.");
    if (group.members.includes(userId))
      return res.error(400, "Already Joined", "You are already a member.");
    if (group.members.length >= group.maxMembers)
      return res.error(400, "Full", "This group is full.");
    if (group.isPrivate && group.inviteCode !== inviteCode)
      return res.error(403, "Forbidden", "Invalid invite code.");

    group.members.push(userId);
    await group.save();
    res.success(200, null, "Joined study group successfully.");
  })
);

// POST /api/study-groups/:groupId/leave — leave group
r.post(
  "/:groupId/leave",
  asyncHandler(async (req, res) => {
    const { groupId } = req.params;
    const userId = req.account.account_id;

    const group = await StudyGroup.findById(groupId);
    if (!group) return res.error(404, "Not Found", "Group not found.");
    if (!group.members.includes(userId))
      return res.error(400, "Not a Member", "You are not a member of this group.");

    group.members.pull(userId);
    await group.save();
    res.success(200, null, "Left study group.");
  })
);

// GET /api/study-groups/:groupId/messages?page=1&limit=50
r.get(
  "/:groupId/messages",
  asyncHandler(async (req, res) => {
    const { groupId } = req.params;
    const { page = 1, limit = 50 } = req.query;
    const userId = req.account.account_id;

    const group = await StudyGroup.findById(groupId);
    if (!group) return res.error(404, "Not Found", "Group not found.");
    if (!group.members.map(String).includes(String(userId)))
      return res.error(403, "Forbidden", "Join the group to view messages.");

    const skip = (Number(page) - 1) * Number(limit);
    const messages = await GroupMessage.find({ groupId })
      .sort({ createdAt: 1 })
      .skip(skip)
      .limit(Number(limit))
      .populate("authorId", "name email");

    res.success(200, messages, "Messages fetched.");
  })
);

// POST /api/study-groups/:groupId/messages — send message
r.post(
  "/:groupId/messages",
  asyncHandler(async (req, res) => {
    const { groupId } = req.params;
    const { message } = req.body;
    const userId = req.account.account_id;

    if (!message) return res.error(400, "Validation Error", "message is required.");

    const group = await StudyGroup.findById(groupId);
    if (!group) return res.error(404, "Not Found", "Group not found.");
    if (!group.members.map(String).includes(String(userId)))
      return res.error(403, "Forbidden", "Join the group to send messages.");

    const msg = await GroupMessage.create({ groupId, message, authorId: userId });
    await msg.populate("authorId", "name email");
    res.success(201, msg, "Message sent.");
  })
);

// DELETE /api/study-groups/:groupId — delete group (creator or admin)
r.delete(
  "/:groupId",
  asyncHandler(async (req, res) => {
    const { groupId } = req.params;
    const userId = req.account.account_id;
    const account = await accountModel.findById(userId);
    const group = await StudyGroup.findById(groupId);
    if (!group) return res.error(404, "Not Found", "Group not found.");

    const isCreator = group.createdBy.toString() === String(userId);
    const isAdmin = account?.role === "ADMIN";
    if (!isCreator && !isAdmin) return res.error(403, "Forbidden", "Not authorized.");

    await GroupMessage.deleteMany({ groupId });
    await StudyGroup.findByIdAndDelete(groupId);
    res.success(200, null, "Group deleted.");
  })
);

// ADMIN: GET all groups
r.get(
  "/admin/all",
  verifyRoles("ADMIN"),
  asyncHandler(async (req, res) => {
    const groups = await StudyGroup.find()
      .sort({ createdAt: -1 })
      .populate("createdBy", "name email")
      .populate("courseId", "title")
      .populate("members", "name");
    res.success(200, groups, "All study groups fetched.");
  })
);

export default r;
