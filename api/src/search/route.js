import express from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { verifyToken } from "../middleware/auth.js";
import { courseContentModel } from "../course/models/content.js";
import { quizModel } from "../quiz/model.js";
import { ForumPost } from "../forums/model.js";

const r = express.Router();
r.use(verifyToken);

// GET /api/search/global?q=
r.get(
  "/global",
  asyncHandler(async (req, res) => {
    const { q } = req.query;
    if (!q || !q.trim()) {
      return res.success(200, { lessons: [], quizzes: [], forums: [] }, "Empty query search.");
    }

    const queryStr = q.trim();

    const [lessons, quizzes, forums] = await Promise.all([
      courseContentModel
        .find({ title: { $regex: queryStr, $options: "i" } })
        .populate("thumbnail", "url")
        .populate({
          path: "folder_id",
          populate: {
            path: "course_id",
            select: "title",
          },
        })
        .limit(10),
      quizModel
        .find({ title: { $regex: queryStr, $options: "i" } })
        .select("title questions")
        .limit(10),
      ForumPost
        .find({
          $or: [
            { title: { $regex: queryStr, $options: "i" } },
            { body: { $regex: queryStr, $options: "i" } },
          ],
        })
        .populate("authorId", "name")
        .limit(10),
    ]);

    res.success(200, { lessons, quizzes, forums }, "Global search results fetched.");
  })
);

export default r;
