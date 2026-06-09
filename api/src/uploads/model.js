import mongoose from "mongoose";

const uploadSchema = new mongoose.Schema({
  course_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "courses",
    default: null,
  },
  file_name: {
    type: String,
    required: true,
  },
  url: {
    type: String,
    required: true,
  },
  size: {
    type: Number,
  },
});

export const uploadModel = mongoose.model("uploads", uploadSchema);
