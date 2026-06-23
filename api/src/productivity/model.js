import mongoose from "mongoose";

// Calendar Event / Reminder / Deadline Schema
const calendarEventSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user_accounts",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    type: {
      type: String,
      enum: ["deadline", "reminder", "event"],
      default: "reminder",
    },
    dueDate: {
      type: Date,
      required: true,
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "courses",
      default: null,
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Watch Later Schema
const watchLaterSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user_accounts",
      required: true,
      index: true,
    },
    contentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "course_contents",
      required: true,
    },
  },
  { timestamps: true }
);

watchLaterSchema.index({ userId: 1, contentId: 1 }, { unique: true });

// Video Playback Progress Schema
const videoProgressSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user_accounts",
      required: true,
      index: true,
    },
    contentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "course_contents",
      required: true,
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "courses",
      required: true,
    },
    playbackTime: {
      type: Number,
      required: true,
      default: 0,
    },
    duration: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  { timestamps: true }
);

videoProgressSchema.index({ userId: 1, contentId: 1 }, { unique: true });

export const CalendarEvent = mongoose.model("calendar_events", calendarEventSchema);
export const WatchLater = mongoose.model("watch_laters", watchLaterSchema);
export const VideoProgress = mongoose.model("video_progresses", videoProgressSchema);
