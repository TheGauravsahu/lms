import express from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { verifyToken, verifyRoles } from "../middleware/auth.js";
import { Announcement } from "./model.js";
import { purchaseModel } from "../purchase/model.js";
import { deletePattern, getCache, setCache } from "../config/redis.js";

const r = express.Router();
r.use(verifyToken);

// GET /api/announcements — get announcements (filtered for students, all for admins)
r.get(
  "/",
  asyncHandler(async (req, res) => {
    const userId = req.account.account_id;
    const role = req.account.role;

    const cacheKey = role === "ADMIN" ? "announcements:admin" : `announcements:user:${userId}`;
    const cached = await getCache(cacheKey);
    if (cached) return res.success(200, cached, "Announcements fetched successfully.");

    let announcements;

    if (role === "ADMIN") {
      announcements = await Announcement.find()
        .sort({ createdAt: -1 })
        .populate("createdBy", "name email")
        .populate("courseId", "title");
    } else {
      // Find purchased courses
      const purchases = await purchaseModel.find({
        account_id: userId,
        status: "COMPLETED",
      });
      const purchasedCourseIds = purchases.map((p) => p.course_id);

      announcements = await Announcement.find({
        $or: [
          { courseId: null },
          { courseId: { $in: purchasedCourseIds } },
        ],
      })
        .sort({ createdAt: -1 })
        .populate("createdBy", "name email")
        .populate("courseId", "title");
    }

    await setCache(cacheKey, announcements, 300); // 5 minutes TTL
    res.success(200, announcements, "Announcements fetched successfully.");
  })
);

// POST /api/announcements — send updates (admin only)
r.post(
  "/",
  verifyRoles("ADMIN"),
  asyncHandler(async (req, res) => {
    const { title, body, courseId } = req.body;
    if (!title || !body)
      return res.error(400, "Validation Error", "title and body are required.");

    const announcement = await Announcement.create({
      title,
      body,
      courseId: courseId === "all" || !courseId ? null : courseId,
      createdBy: req.account.account_id,
    });

    await announcement.populate("createdBy", "name email");
    if (announcement.courseId) {
      await announcement.populate("courseId", "title");
    }

    // Invalidate all announcement caches
    await deletePattern("announcements:*");

    res.success(201, announcement, "Announcement created successfully.");
  })
);

// DELETE /api/announcements/:id — delete announcement (admin only)
r.delete(
  "/:id",
  verifyRoles("ADMIN"),
  asyncHandler(async (req, res) => {
    const announcement = await Announcement.findByIdAndDelete(req.params.id);
    if (!announcement) return res.error(404, "Not Found", "Announcement not found.");

    await deletePattern("announcements:*");
    res.success(200, null, "Announcement deleted successfully.");
  })
);

export default r;
