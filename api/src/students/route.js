import express from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { accountModel } from "../auth/model.js";
import { verifyToken, verifyRoles } from "../middleware/auth.js";
import { deleteCache, getCache, setCache, deletePattern } from "../config/redis.js";

const r = express.Router();
r.use(verifyToken);

// Student gamification endpoints (accessible by USER and ADMIN roles)
r.get(
  "/leaderboard",
  asyncHandler(async (req, res) => {
    const LEADERBOARD_CACHE_KEY = "gamification:leaderboard";
    const cached = await getCache(LEADERBOARD_CACHE_KEY);
    if (cached) return res.success(200, cached, "Leaderboard fetched successfully.");

    const users = await accountModel
      .find({ role: "USER" })
      .sort({ xp: -1 })
      .limit(10)
      .select("name email xp badges");

    await setCache(LEADERBOARD_CACHE_KEY, users, 300); // 5 minutes cache
    res.success(200, users, "Leaderboard fetched successfully.");
  }),
);

r.post(
  "/earn-xp",
  asyncHandler(async (req, res) => {
    const { xp, badge } = req.body;
    const account_id = req.account.account_id;

    const account = await accountModel.findById(account_id);
    if (!account) return res.error(404, "Not Found", "Account not found.");

    if (xp) {
      account.xp = (account.xp || 0) + xp;
    }

    let unlockedBadge = null;
    if (badge && !account.badges.includes(badge)) {
      account.badges.push(badge);
      unlockedBadge = badge;
    }

    await account.save();
    
    // Invalidate caches
    await deleteCache("gamification:leaderboard");
    await deletePattern("students:*");

    res.success(200, { account, unlockedBadge }, "Rewards earned successfully.");
  }),
);

r.use(verifyRoles("ADMIN"));

const STUDENTS_CACHE_KEY = "students:all";
const STUDENT_TTL = 60 * 10; // 10 minutes

// GET /api/students — list users with role USER (optionally paginated & searched)
r.get(
  "/",
  asyncHandler(async (req, res) => {
    const { page, limit, search } = req.query;

    let query = { role: "USER" };
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { mobile_no: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    if (page && limit) {
      const p = Number(page) || 1;
      const l = Number(limit) || 10;
      const skip = (p - 1) * l;

      const cacheKey = `students:page:${p}:limit:${l}:search:${search || ""}`;
      const cached = await getCache(cacheKey);
      if (cached) return res.success(200, cached, "Students fetched successfully.");

      const [students, total, active, blocked, unverified] = await Promise.all([
        accountModel
          .find(query)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(l)
          .select("-tokenVersion"),
        accountModel.countDocuments(query),
        accountModel.countDocuments({ role: "USER", status: "ACTIVE" }),
        accountModel.countDocuments({ role: "USER", status: "BLOCKED" }),
        accountModel.countDocuments({ role: "USER", status: "UNVERIFIED" }),
      ]);

      const result = {
        students,
        total,
        page: p,
        limit: l,
        stats: {
          total: active + blocked + unverified,
          active,
          blocked,
          unverified,
        },
      };

      await setCache(cacheKey, result, 300); // 5 minutes TTL
      return res.success(200, result, "Students fetched successfully.");
    } else {
      const cacheKey = search ? `students:search:${search}` : "students:all";
      const cached = await getCache(cacheKey);
      if (cached) return res.success(200, cached, "Students fetched successfully.");

      const students = await accountModel
        .find(query)
        .sort({ createdAt: -1 })
        .select("-tokenVersion");

      await setCache(cacheKey, students, 600); // 10 minutes TTL
      res.success(200, students, "Students fetched successfully.");
    }
  }),
);

// POST /api/students — create a new student account
r.post(
  "/",
  asyncHandler(async (req, res) => {
    const { name, mobile_no, email } = req.body;
    if (!name || !mobile_no)
      return res.error(400, "Validation Error", "name and mobile_no are required.");

    const exists = await accountModel.findOne({ mobile_no });
    if (exists)
      return res.error(400, "Already Exists", "A student with this mobile number already exists.");

    const student = await accountModel.create({
      name,
      mobile_no,
      email: email || undefined,
      role: "USER",
      status: "ACTIVE",
    });

    await deletePattern("students:*");
    res.success(201, student, "Student created successfully.");
  }),
);

// PUT /api/students/:id — edit a student
r.put(
  "/:id",
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { name, mobile_no, email, status } = req.body;

    const student = await accountModel.findById(id);
    if (!student || student.role !== "USER")
      return res.error(404, "Not Found", "Student not found.");

    const updated = await accountModel.findByIdAndUpdate(
      id,
      { name, mobile_no, email, status },
      { new: true, runValidators: true },
    );

    await deletePattern("students:*");
    res.success(200, updated, "Student updated successfully.");
  }),
);

// DELETE /api/students/:id — delete a student
r.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const student = await accountModel.findById(id);
    if (!student || student.role !== "USER")
      return res.error(404, "Not Found", "Student not found.");

    await accountModel.findByIdAndDelete(id);
    await deletePattern("students:*");
    res.success(200, null, "Student deleted successfully.");
  }),
);

export default r;
