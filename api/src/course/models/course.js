import mongoose from "mongoose";
import { COURSE_STATUS } from "../../utils/constants.js";

const courseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    thumbnail: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "uploads",
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

export const courseModel = mongoose.model("courses", courseSchema);
