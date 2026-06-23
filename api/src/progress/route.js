import express from "express";
import { verifyToken } from "../middleware/auth.js";
import { progressController } from "./controller.js";

const r = express.Router();

r.use(verifyToken);

r.get("/:course_id", progressController.getProgress);
r.post("/toggle", progressController.toggleContent);

export default r;
