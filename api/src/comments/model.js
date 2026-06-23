import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
  {
    content_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "course_contents",
      required: true,
    },
    account_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user_accounts",
      required: true,
    },
    comment: {
      type: String,
      required: true,
    },
    parent_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "comments",
      default: null,
    },
  },
  { timestamps: true },
);

export const commentModel = mongoose.model("comments", commentSchema);
