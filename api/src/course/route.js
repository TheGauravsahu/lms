import express from "express";
import { courseController } from "./controller.js";
import { uploadMiddleware } from "../middleware/upload.js";
import { upload } from "../config/storage.js";

const r = express.Router();

r.post(
  "/create-course",
  upload.single("thumbnail"),
  uploadMiddleware,
  courseController.createCourse,
);

export default r;
