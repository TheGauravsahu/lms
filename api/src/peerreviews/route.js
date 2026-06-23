import express from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { verifyToken, verifyRoles } from "../middleware/auth.js";
import { PeerReview } from "./model.js";
import { accountModel } from "../auth/model.js";
import { deleteCache, getCache, setCache, deletePattern } from "../config/redis.js";

const r = express.Router();
r.use(verifyToken);

// GET /api/peer-reviews?language=&status=open&page=1&limit=20
r.get(
  "/",
  asyncHandler(async (req, res) => {
    const { language, status, page = 1, limit = 20 } = req.query;
    const cacheKey = `peerreviews:list:lang:${language || "all"}:status:${status || "all"}:page:${page}:limit:${limit}`;
    const cached = await getCache(cacheKey);
    if (cached) return res.success(200, cached, "Peer reviews fetched.");

    const filter = {};
    if (language) filter.language = language;
    if (status) filter.status = status;

    const skip = (Number(page) - 1) * Number(limit);
    const [reviews, total] = await Promise.all([
      PeerReview.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .populate("submitterId", "name email xp badges")
        .select("-code"), // Don't send code in list view
      PeerReview.countDocuments(filter),
    ]);

    const result = { reviews, total };
    await setCache(cacheKey, result, 300); // 5 minutes TTL
    res.success(200, result, "Peer reviews fetched.");
  })
);

// GET /api/peer-reviews/:reviewId — full review + code + comments
r.get(
  "/:reviewId",
  asyncHandler(async (req, res) => {
    const { reviewId } = req.params;
    const cacheKey = `peerreviews:review:${reviewId}`;
    const cached = await getCache(cacheKey);
    if (cached) return res.success(200, cached, "Peer review fetched.");

    const review = await PeerReview.findById(reviewId)
      .populate("submitterId", "name email xp badges")
      .populate("comments.authorId", "name email xp badges");

    if (!review) return res.error(404, "Not Found", "Peer review not found.");
    await setCache(cacheKey, review, 300); // 5 minutes TTL
    res.success(200, review, "Peer review fetched.");
  })
);

// POST /api/peer-reviews — submit code for review
r.post(
  "/",
  asyncHandler(async (req, res) => {
    const { title, description, language, code } = req.body;
    if (!title || !code) return res.error(400, "Validation Error", "title and code are required.");

    const review = await PeerReview.create({
      title,
      description,
      language: language || "javascript",
      code,
      submitterId: req.account.account_id,
    });

    await review.populate("submitterId", "name email");
    await deletePattern("peerreviews:list:*");
    res.success(201, review, "Code submitted for peer review.");
  })
);

// POST /api/peer-reviews/:reviewId/comment — add inline comment (earn XP)
r.post(
  "/:reviewId/comment",
  asyncHandler(async (req, res) => {
    const { reviewId } = req.params;
    const { comment, lineNumber } = req.body;
    const userId = req.account.account_id;

    if (!comment) return res.error(400, "Validation Error", "comment is required.");

    const review = await PeerReview.findById(reviewId);
    if (!review) return res.error(404, "Not Found", "Review not found.");
    if (review.status === "closed") return res.error(400, "Closed", "This review is closed.");
    if (review.submitterId.toString() === String(userId))
      return res.error(400, "Not Allowed", "You cannot review your own code.");

    review.comments.push({ comment, lineNumber, authorId: userId });
    await review.save();

    // Award XP to reviewer
    await accountModel.findByIdAndUpdate(userId, { $inc: { xp: 30 } });
    await deleteCache("gamification:leaderboard");

    await review.populate("comments.authorId", "name email xp badges");
    const newComment = review.comments[review.comments.length - 1];
    await deleteCache(`peerreviews:review:${reviewId}`);
    await deletePattern("peerreviews:list:*");
    res.success(201, newComment, "Comment added. +30 XP earned!");
  })
);

// PATCH /api/peer-reviews/:reviewId/close — close review (submitter only)
r.patch(
  "/:reviewId/close",
  asyncHandler(async (req, res) => {
    const { reviewId } = req.params;
    const userId = req.account.account_id;

    const review = await PeerReview.findById(reviewId);
    if (!review) return res.error(404, "Not Found", "Review not found.");
    if (review.submitterId.toString() !== String(userId))
      return res.error(403, "Forbidden", "Only the submitter can close a review.");

    review.status = "closed";
    await review.save();
    await deleteCache(`peerreviews:review:${reviewId}`);
    await deletePattern("peerreviews:list:*");
    res.success(200, review, "Review closed.");
  })
);

// POST /api/peer-reviews/:reviewId/rate — rate review quality
r.post(
  "/:reviewId/rate",
  asyncHandler(async (req, res) => {
    const { reviewId } = req.params;
    const { rating } = req.body;
    const userId = req.account.account_id;

    if (!rating || rating < 1 || rating > 5)
      return res.error(400, "Validation Error", "Rating must be between 1 and 5.");

    const review = await PeerReview.findById(reviewId);
    if (!review) return res.error(404, "Not Found", "Review not found.");
    if (review.submitterId.toString() !== String(userId))
      return res.error(403, "Forbidden", "Only the submitter can rate a review.");

    review.rating = rating;
    await review.save();
    await deleteCache(`peerreviews:review:${reviewId}`);
    await deletePattern("peerreviews:list:*");
    res.success(200, review, "Review rated.");
  })
);

// ADMIN: delete review
r.delete(
  "/:reviewId",
  verifyRoles("ADMIN"),
  asyncHandler(async (req, res) => {
    const review = await PeerReview.findByIdAndDelete(req.params.reviewId);
    if (!review) return res.error(404, "Not Found", "Review not found.");
    await deleteCache(`peerreviews:review:${req.params.reviewId}`);
    await deletePattern("peerreviews:list:*");
    res.success(200, null, "Review deleted.");
  })
);

export default r;
