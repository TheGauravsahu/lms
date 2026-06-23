import express from "express";
import { verifyToken } from "../middleware/auth.js";
import { reviewController } from "./controller.js";

const r = express.Router();

// Public: View course reviews
r.get("/:course_id", reviewController.getCourseReviews);

// Protected: Write and delete reviews
r.post("/", verifyToken, reviewController.addReview);
r.delete("/:review_id", verifyToken, reviewController.deleteReview);

export default r;
