import express from "express";
import { upload } from "../config/storage.js";
import { uploadMiddleware } from "../middleware/upload.js";
import { uploadController } from "./controller.js";
import { verifyToken } from "../middleware/auth.js";

const r = express.Router();
// r.use(verifyToken);

r.post(
  "/upload",
  upload.single("file"),
  uploadMiddleware,
  uploadController.uploadFile,
);

r.get("/recent-uploads", uploadController.getRecentUploads);

export default r;
