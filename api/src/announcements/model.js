import mongoose from "mongoose";

const announcementSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    body: {
      type: String,
      required: true,
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "courses",
      default: null, // null means global announcement to all students
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user_accounts",
      required: true,
    },
  },
  { timestamps: true }
);

export const Announcement = mongoose.model("announcements", announcementSchema);
