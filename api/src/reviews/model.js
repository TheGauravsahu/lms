import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    course_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "courses",
      required: true,
    },
    account_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user_accounts",
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    review_text: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

// Prevent duplicate reviews per student per course
reviewSchema.index({ course_id: 1, account_id: 1 }, { unique: true });

export const reviewModel = mongoose.model("Review", reviewSchema);
