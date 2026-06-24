import ImageKit, { toFile } from "@imagekit/nodejs";
import env from "../config/env.js";

const imagekit = new ImageKit({
  privateKey: env.IMAGEKIT_PRIVATE_KEY,
});

export const uploadMiddleware = async (req, res, next) => {
  try {
    const result = await imagekit.files.upload({
      file: await toFile(req.file.buffer, req.file.originalname),
      fileName: req.file.originalname,
      folder: env.NODE_ENV === "prod" ? "/lms_prod" : "lms_uploads",
    });

    const upload = {
      url: result.url,
      size: result.size,
    };
    console.log("UPLOADED ✅", upload);
    req.upload = upload;
    next();
  } catch (err) {
    next(err);
  }
};
