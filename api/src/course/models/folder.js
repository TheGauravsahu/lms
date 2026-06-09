import mongoose from "mongoose";

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
      type: mongoose.Schema.Types.ObjectId,
      ref: "uploads",
      required: true,
    },
  },
  { timestamps: true },
);

export const courseFolderModel = mongoose.model("course_folders", folderSchema);
