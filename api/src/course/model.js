import mongoose from "mongoose";
import { COURSE_STATUS } from "../utils/constants";

const courseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    thumbnail: {
      type: String,
      required: true,
    },
    validity: {
      type: Number,
      required: true,
    },
    offer_price: {
      type: Number,
      required: true,
    },
    original_price: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: COURSE_STATUS,
      default: "DRAFT",
    },

    // others
    is_trending: {
      type: Boolean,
      default: false,
    },
    is_new: {
      type: Boolean,
      default: true,
    },
    is_featured: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

const folderSchema = new mongoose.Schema(
  {
    course_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "courses",
      required: true,
    },
    parent_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "course_folders",
      default: null,
    },
    title: {
      type: String,
      required: true,
    },
    thumbnail: {
      type: String,
      required: true,
    },
  },
  { timestamps: true },
);

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
    type: {
      type: String,
      enum: CONTENT_TYPE,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
    duration: Number,
    size: Number,
  },
  { timestamps: true },
);

export const courseModel = mongoose.model("courses", courseSchema);
export const courseFolderModel = mongoose.model("course_folders", folderSchema);
export const courseContentModel = mongoose.model("course_contents", contentSchema);