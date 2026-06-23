import { reviewModel } from "./model.js";
import { purchaseModel } from "../purchase/model.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const reviewController = {
  // Create or Update a review (upsert behaviour for better user experience)
  addReview: asyncHandler(async (req, res) => {
    const { course_id, rating, review_text } = req.body;
    const account_id = req.user.id;

    if (!course_id || !rating) {
      return res.error(400, "Bad Request", "course_id and rating are required.");
    }

    if (rating < 1 || rating > 5) {
      return res.error(400, "Bad Request", "Rating must be between 1 and 5.");
    }

    // Verify student has purchased the course
    const purchase = await purchaseModel.findOne({ account_id, course_id });
    if (!purchase) {
      return res.error(403, "Forbidden", "You can only review courses you have purchased.");
    }

    // Upsert review: edit if exists, create if new
    let review = await reviewModel.findOne({ course_id, account_id });
    if (review) {
      review.rating = rating;
      review.review_text = review_text || "";
      await review.save();
    } else {
      review = await reviewModel.create({
        course_id,
        account_id,
        rating,
        review_text: review_text || "",
      });
    }

    res.success(200, review, "Review submitted successfully.");
  }),

  // Get all reviews for a course (with average rating summary)
  getCourseReviews: asyncHandler(async (req, res) => {
    const { course_id } = req.params;

    if (!course_id) {
      return res.error(400, "Bad Request", "course_id parameter is required.");
    }

    const reviews = await reviewModel
      .find({ course_id })
      .populate("account_id", "name")
      .sort({ createdAt: -1 });

    // Calculate dynamic stats
    let totalRating = 0;
    const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

    reviews.forEach((r) => {
      totalRating += r.rating;
      if (ratingDistribution[r.rating] !== undefined) {
        ratingDistribution[r.rating]++;
      }
    });

    const averageRating = reviews.length > 0 ? Number((totalRating / reviews.length).toFixed(1)) : 0;

    res.success(
      200,
      {
        reviews,
        summary: {
          averageRating,
          totalReviews: reviews.length,
          ratingDistribution,
        },
      },
      "Course reviews fetched successfully."
    );
  }),

  // Delete a review (by owner or admin)
  deleteReview: asyncHandler(async (req, res) => {
    const { review_id } = req.params;
    const account_id = req.user.id;
    const isClientAdmin = req.user.role === "ADMIN";

    const review = await reviewModel.findById(review_id);
    if (!review) {
      return res.error(404, "Not Found", "Review not found.");
    }

    // Verify ownership or admin privileges
    if (review.account_id.toString() !== account_id && !isClientAdmin) {
      return res.error(403, "Forbidden", "You are not authorized to delete this review.");
    }

    await reviewModel.findByIdAndDelete(review_id);
    res.success(200, null, "Review deleted successfully.");
  }),
};
