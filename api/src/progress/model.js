import mongoose from "mongoose";

const progressSchema = new mongoose.Schema(
  {
    account_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user_accounts",
      required: true,
    },
    course_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "courses",
      required: true,
    },
    completed_contents: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "course_contents",
      },
    ],
  },
  { timestamps: true },
);

progressSchema.index({ account_id: 1, course_id: 1 }, { unique: true });

export const progressModel = mongoose.model("course_progress", progressSchema);
