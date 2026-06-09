import { uploadModel } from "./model.js";
import { asyncHandler } from "../utils/asyncHandler.js";

class UploadController {
  uploadFile = asyncHandler(async (req, res) => {
    const data = await uploadModel.create({
      course_id: req.body.course_id,
      file_name: req.file.originalname,
      size: req.upload.size,
      url: req.upload.url,
    });
    res.success(201, data, "File uploaded successfully");
  });

  getRecentUploads = asyncHandler(async (req, res) => {
    res.success(
      200,
      await uploadModel.find().limit(5), // todo: add .sort(createdAt)
      "Recent Uplods fetched successfully.",
    );
  });
}

export const uploadController = new UploadController();
