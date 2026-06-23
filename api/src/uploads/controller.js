import { uploadModel } from "./model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { deleteCache, getCache, setCache } from "../config/redis.js";

const UPLOADS_CACHE_KEY = "uploads:recent";
const UPLOADS_TTL = 60 * 2; // 2 minutes

class UploadController {
  uploadFile = asyncHandler(async (req, res) => {
    const data = await uploadModel.create({
      course_id: req.body.course_id,
      file_name: req.file.originalname,
      size: req.upload.size,
      url: req.upload.url,
    });
    await deleteCache(UPLOADS_CACHE_KEY);
    res.success(201, data, "File uploaded successfully");
  });

  getRecentUploads = asyncHandler(async (req, res) => {
    const cached = await getCache(UPLOADS_CACHE_KEY);
    if (cached) return res.success(200, cached, "Recent Uploads fetched successfully.");

    const uploads = await uploadModel.find().sort({ createdAt: -1 }).limit(5);
    await setCache(UPLOADS_CACHE_KEY, uploads, UPLOADS_TTL);
    res.success(200, uploads, "Recent Uploads fetched successfully.");
  });
}

export const uploadController = new UploadController();
