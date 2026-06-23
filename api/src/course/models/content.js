import mongoose from "mongoose";
import { CONTENT_TYPE } from "../../utils/constants.js";

const contentSchema = new mongoose.Schema(
  {
    folder_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "course_folders",
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    thumbnail: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "uploads",
      default: null,
    },
    content_type: {
      type: String,
      enum: CONTENT_TYPE,
      required: true,
    },
    content: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "uploads",
      required: false,
    },
    quiz_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Quiz",
      default: null,
    },
  },
  { timestamps: true },
);

export const courseContentModel = mongoose.model(
  "course_contents",
  contentSchema,
);
