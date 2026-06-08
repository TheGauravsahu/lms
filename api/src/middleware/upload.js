import ImageKit, { toFile } from "@imagekit/nodejs";
import env from "../config/env.js";

const imagekit = new ImageKit({
  privateKey: env.IMAGEKIT_PRIVATE_KEY,
});

export const uploadMiddleware = async (req, res, next) => {
  if (!req.file) {
    return res.error(400, null, "No file uploaded");
  }
  const result = await imagekit.files.upload({
    file: await toFile(req.file.buffer, req.file.originalname),
    fileName: req.file.originalname,
    folder: "/lms_uploads",
  });
  console.log("UPLOADED ✅", result);
  req.thumbnail_url = result.url;
  next();
};
