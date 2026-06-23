import express from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { verifyToken } from "../middleware/auth.js";
import { CalendarEvent, WatchLater, VideoProgress } from "./model.js";
import { purchaseModel } from "../purchase/model.js";
import { courseFolderModel } from "../course/models/folder.js";
import { courseContentModel } from "../course/models/content.js";
import { deleteCache, getCache, setCache } from "../config/redis.js";

const r = express.Router();
r.use(verifyToken);

// ─────────────────────────────────────────────────────────────────────────────
// 📅 CALENDAR & DEADLINES
// ─────────────────────────────────────────────────────────────────────────────

// GET /api/productivity/calendar
r.get(
  "/calendar",
  asyncHandler(async (req, res) => {
    const userId = req.account.account_id;
    const cacheKey = `productivity:calendar:${userId}`;
    const cached = await getCache(cacheKey);
    if (cached) return res.success(200, cached, "Calendar events fetched.");

    const events = await CalendarEvent.find({ userId })
      .sort({ dueDate: 1 })
      .populate("courseId", "title");

    await setCache(cacheKey, events, 300);
    res.success(200, events, "Calendar events fetched.");
  })
);

// POST /api/productivity/calendar
r.post(
  "/calendar",
  asyncHandler(async (req, res) => {
    const userId = req.account.account_id;
    const { title, description, type, dueDate, courseId } = req.body;
    if (!title || !dueDate)
      return res.error(400, "Validation Error", "title and dueDate are required.");

    const event = await CalendarEvent.create({
      userId,
      title,
      description,
      type,
      dueDate,
      courseId: courseId || null,
    });

    await deleteCache(`productivity:calendar:${userId}`);
    res.success(201, event, "Calendar event created.");
  })
);

// PUT /api/productivity/calendar/:id
r.put(
  "/calendar/:id",
  asyncHandler(async (req, res) => {
    const userId = req.account.account_id;
    const { title, description, type, dueDate, isCompleted } = req.body;

    const event = await CalendarEvent.findOneAndUpdate(
      { _id: req.params.id, userId },
      { title, description, type, dueDate, isCompleted },
      { new: true, runValidators: true }
    );

    if (!event) return res.error(404, "Not Found", "Event not found.");

    await deleteCache(`productivity:calendar:${userId}`);
    res.success(200, event, "Calendar event updated.");
  })
);

// DELETE /api/productivity/calendar/:id
r.delete(
  "/calendar/:id",
  asyncHandler(async (req, res) => {
    const userId = req.account.account_id;
    const event = await CalendarEvent.findOneAndDelete({ _id: req.params.id, userId });
    if (!event) return res.error(404, "Not Found", "Event not found.");

    await deleteCache(`productivity:calendar:${userId}`);
    res.success(200, null, "Calendar event deleted.");
  })
);

// ─────────────────────────────────────────────────────────────────────────────
// 📺 WATCH LATER
// ─────────────────────────────────────────────────────────────────────────────

// GET /api/productivity/watch-later
r.get(
  "/watch-later",
  asyncHandler(async (req, res) => {
    const userId = req.account.account_id;
    const cacheKey = `productivity:watchlater:${userId}`;
    const cached = await getCache(cacheKey);
    if (cached) return res.success(200, cached, "Watch later list fetched.");

    const list = await WatchLater.find({ userId })
      .sort({ createdAt: -1 })
      .populate({
        path: "contentId",
        populate: {
          path: "thumbnail content",
          select: "url",
        },
      });

    await setCache(cacheKey, list, 300);
    res.success(200, list, "Watch later list fetched.");
  })
);

// POST /api/productivity/watch-later
r.post(
  "/watch-later",
  asyncHandler(async (req, res) => {
    const userId = req.account.account_id;
    const { contentId } = req.body;
    if (!contentId) return res.error(400, "Validation Error", "contentId is required.");

    // Check if already exists to prevent duplicate key error
    const exists = await WatchLater.findOne({ userId, contentId });
    if (exists) return res.success(200, exists, "Already in Watch Later list.");

    const item = await WatchLater.create({ userId, contentId });
    await deleteCache(`productivity:watchlater:${userId}`);
    res.success(201, item, "Added to Watch Later list.");
  })
);

// DELETE /api/productivity/watch-later/:contentId
r.delete(
  "/watch-later/:contentId",
  asyncHandler(async (req, res) => {
    const userId = req.account.account_id;
    const item = await WatchLater.findOneAndDelete({ userId, contentId: req.params.contentId });
    if (!item) return res.error(404, "Not Found", "Item not found in Watch Later list.");

    await deleteCache(`productivity:watchlater:${userId}`);
    res.success(200, null, "Removed from Watch Later list.");
  })
);

// ─────────────────────────────────────────────────────────────────────────────
// 🍿 VIDEO PLAYBACK TRACKING (CONTINUE WATCHING)
// ─────────────────────────────────────────────────────────────────────────────

// GET /api/productivity/video-progress
r.get(
  "/video-progress",
  asyncHandler(async (req, res) => {
    const userId = req.account.account_id;
    const cacheKey = `productivity:videoprogress:${userId}`;
    const cached = await getCache(cacheKey);
    if (cached) return res.success(200, cached, "Video playback progress fetched.");

    const progresses = await VideoProgress.find({ userId })
      .sort({ updatedAt: -1 })
      .populate({
        path: "contentId",
        populate: {
          path: "thumbnail content",
          select: "url",
        },
      })
      .populate("courseId", "title");

    await setCache(cacheKey, progresses, 300);
    res.success(200, progresses, "Video playback progress fetched.");
  })
);

// POST /api/productivity/video-progress
r.post(
  "/video-progress",
  asyncHandler(async (req, res) => {
    const userId = req.account.account_id;
    const { contentId, courseId, playbackTime, duration } = req.body;

    if (!contentId || !courseId || playbackTime === undefined || !duration) {
      return res.error(400, "Validation Error", "contentId, courseId, playbackTime, and duration are required.");
    }

    let progress;
    // If user watched more than 95%, treat as fully watched and delete it from continue watching list
    if (playbackTime >= duration * 0.95) {
      await VideoProgress.findOneAndDelete({ userId, contentId });
      progress = null;
    } else {
      progress = await VideoProgress.findOneAndUpdate(
        { userId, contentId },
        { courseId, playbackTime, duration },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
    }

    await deleteCache(`productivity:videoprogress:${userId}`);
    res.success(200, progress, "Video playback progress updated.");
  })
);

// ─────────────────────────────────────────────────────────────────────────────
// 📥 CENTRAL DOWNLOADS / RESOURCES
// ─────────────────────────────────────────────────────────────────────────────

// GET /api/productivity/resources — centralized listing of PDF files
r.get(
  "/resources",
  asyncHandler(async (req, res) => {
    const userId = req.account.account_id;
    const cacheKey = `productivity:resources:${userId}`;
    const cached = await getCache(cacheKey);
    if (cached) return res.success(200, cached, "Downloadable resources fetched.");

    // 1. Find completed purchases
    const purchases = await purchaseModel.find({
      account_id: userId,
      status: "COMPLETED",
    });
    const purchasedCourseIds = purchases.map((p) => p.course_id);

    // 2. Find folders for purchased courses
    const folders = await courseFolderModel.find({
      course_id: { $in: purchasedCourseIds },
    });
    const folderIds = folders.map((f) => f._id);

    // 3. Find contents inside these folders that are PDFs
    const resources = await courseContentModel
      .find({
        folder_id: { $in: folderIds },
        content_type: "PDF",
      })
      .populate("content", "url size name")
      .populate("thumbnail", "url")
      .populate({
        path: "folder_id",
        populate: {
          path: "course_id",
          select: "title",
        },
      });

    await setCache(cacheKey, resources, 300);
    res.success(200, resources, "Downloadable resources fetched.");
  })
);

export default r;
