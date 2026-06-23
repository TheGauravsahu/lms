import express from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { verifyToken, verifyRoles } from "../middleware/auth.js";
import { ForumPost, ForumReply } from "./model.js";
import { accountModel } from "../auth/model.js";
import { deleteCache } from "../config/redis.js";

const r = express.Router();

// ─── Public / Auth endpoints ──────────────────────────────────────────────────

// GET /api/forums?courseId=&sort=latest|top|unanswered&page=1&limit=20
r.get(
  "/",
  asyncHandler(async (req, res) => {
    const { courseId, sort = "latest", page = 1, limit = 20 } = req.query;
    const filter = {};
    if (courseId) filter.courseId = courseId;
    if (sort === "unanswered") filter.isAnswered = false;

    const sortOption =
      sort === "top"
        ? { upvotes: -1, createdAt: -1 }
        : { isPinned: -1, createdAt: -1 };

    const skip = (Number(page) - 1) * Number(limit);
    const [posts, total] = await Promise.all([
      ForumPost.find(filter)
        .sort(sortOption)
        .skip(skip)
        .limit(Number(limit))
        .populate("authorId", "name email")
        .populate("courseId", "title"),
      ForumPost.countDocuments(filter),
    ]);

    res.success(
      200,
      { posts, total, page: Number(page), limit: Number(limit) },
      "Forum posts fetched.",
    );
  }),
);

// GET /api/forums/:postId — single post with replies
r.get(
  "/:postId",
  asyncHandler(async (req, res) => {
    const { postId } = req.params;
    const post = await ForumPost.findByIdAndUpdate(
      postId,
      { $inc: { views: 1 } },
      { new: true },
    )
      .populate("authorId", "name email xp badges")
      .populate("courseId", "title");

    if (!post) return res.error(404, "Not Found", "Forum post not found.");

    const replies = await ForumReply.find({ postId })
      .sort({ isAccepted: -1, upvotes: -1, createdAt: 1 })
      .populate("authorId", "name email xp badges");

    res.success(200, { post, replies }, "Forum post fetched.");
  }),
);

// Protected routes below
r.use(verifyToken);

// POST /api/forums — create post
r.post(
  "/",
  asyncHandler(async (req, res) => {
    const { title, body, tags, courseId } = req.body;
    if (!title || !body)
      return res.error(400, "Validation Error", "title and body are required.");

    const post = await ForumPost.create({
      title,
      body,
      tags: tags || [],
      courseId: courseId === "none" ? null : courseId,
      authorId: req.account.account_id,
    });

    await post.populate("authorId", "name email");
    res.success(201, post, "Forum post created.");
  }),
);

// POST /api/forums/:postId/replies — add reply
r.post(
  "/:postId/replies",
  asyncHandler(async (req, res) => {
    const { postId } = req.params;
    const { body } = req.body;
    if (!body)
      return res.error(400, "Validation Error", "Reply body is required.");

    const post = await ForumPost.findById(postId);
    if (!post) return res.error(404, "Not Found", "Forum post not found.");

    const reply = await ForumReply.create({
      postId,
      body,
      authorId: req.account.account_id,
    });

    await ForumPost.findByIdAndUpdate(postId, { $inc: { replyCount: 1 } });
    await reply.populate("authorId", "name email xp badges");
    res.success(201, reply, "Reply added.");
  }),
);

// POST /api/forums/:postId/upvote — toggle upvote on post
r.post(
  "/:postId/upvote",
  asyncHandler(async (req, res) => {
    const { postId } = req.params;
    const userId = req.account.account_id;
    const post = await ForumPost.findById(postId);
    if (!post) return res.error(404, "Not Found", "Post not found.");

    const hasUpvoted = post.upvotes.includes(userId);
    if (hasUpvoted) {
      post.upvotes.pull(userId);
    } else {
      post.upvotes.push(userId);
    }
    await post.save();
    res.success(
      200,
      { upvotes: post.upvotes.length, hasUpvoted: !hasUpvoted },
      "Upvote toggled.",
    );
  }),
);

// POST /api/forums/:postId/replies/:replyId/upvote — toggle upvote on reply
r.post(
  "/:postId/replies/:replyId/upvote",
  asyncHandler(async (req, res) => {
    const { replyId } = req.params;
    const userId = req.account.account_id;
    const reply = await ForumReply.findById(replyId);
    if (!reply) return res.error(404, "Not Found", "Reply not found.");

    const hasUpvoted = reply.upvotes.includes(userId);
    if (hasUpvoted) {
      reply.upvotes.pull(userId);
    } else {
      reply.upvotes.push(userId);
    }
    await reply.save();
    res.success(
      200,
      { upvotes: reply.upvotes.length, hasUpvoted: !hasUpvoted },
      "Upvote toggled.",
    );
  }),
);

// POST /api/forums/:postId/replies/:replyId/accept — mark reply as accepted answer
r.post(
  "/:postId/replies/:replyId/accept",
  asyncHandler(async (req, res) => {
    const { postId, replyId } = req.params;
    const userId = req.account.account_id;

    const post = await ForumPost.findById(postId);
    if (!post) return res.error(404, "Not Found", "Post not found.");
    if (post.authorId.toString() !== userId.toString())
      return res.error(
        403,
        "Forbidden",
        "Only the post author can accept answers.",
      );

    // Unaccept all other replies first
    await ForumReply.updateMany({ postId }, { isAccepted: false });
    const reply = await ForumReply.findByIdAndUpdate(
      replyId,
      { isAccepted: true },
      { new: true },
    );
    await ForumPost.findByIdAndUpdate(postId, { isAnswered: true });

    res.success(200, reply, "Reply accepted as answer.");
  }),
);

// DELETE /api/forums/:postId — delete post (author or admin)
r.delete(
  "/:postId",
  asyncHandler(async (req, res) => {
    const { postId } = req.params;
    const userId = req.account.account_id;
    const account = await accountModel.findById(userId);
    const post = await ForumPost.findById(postId);
    if (!post) return res.error(404, "Not Found", "Post not found.");

    const isAuthor = post.authorId.toString() === userId.toString();
    const isAdmin = account?.role === "ADMIN";
    if (!isAuthor && !isAdmin)
      return res.error(403, "Forbidden", "Not authorized.");

    await ForumReply.deleteMany({ postId });
    await ForumPost.findByIdAndDelete(postId);
    res.success(200, null, "Post deleted.");
  }),
);

// PATCH /api/forums/:postId/pin — pin/unpin post (admin only)
r.patch(
  "/:postId/pin",
  verifyRoles("ADMIN"),
  asyncHandler(async (req, res) => {
    const { postId } = req.params;
    const post = await ForumPost.findById(postId);
    if (!post) return res.error(404, "Not Found", "Post not found.");
    post.isPinned = !post.isPinned;
    await post.save();
    res.success(
      200,
      { isPinned: post.isPinned },
      post.isPinned ? "Post pinned." : "Post unpinned.",
    );
  }),
);

export default r;
