import mongoose from "mongoose";

const reviewCommentSchema = new mongoose.Schema(
  {
    authorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user_accounts",
      required: true,
    },
    lineNumber: { type: Number },
    comment: { type: String, required: true, maxlength: 1000 },
  },
  { timestamps: true }
);

const peerReviewSchema = new mongoose.Schema(
  {
    submitterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user_accounts",
      required: true,
    },
    title: { type: String, required: true, trim: true, maxlength: 200 },
    description: { type: String, maxlength: 1000 },
    language: {
      type: String,
      enum: ["javascript", "html", "css", "python", "typescript", "other"],
      default: "javascript",
    },
    code: { type: String, required: true },
    comments: [reviewCommentSchema],
    status: { type: String, enum: ["open", "closed"], default: "open" },
    rating: { type: Number, min: 1, max: 5 },
  },
  { timestamps: true }
);

export const PeerReview = mongoose.model("peer_reviews", peerReviewSchema);
