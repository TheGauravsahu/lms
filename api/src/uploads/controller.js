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
}

export const uploadController = new UploadController();
