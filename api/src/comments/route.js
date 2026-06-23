import express from "express";
import { verifyToken } from "../middleware/auth.js";
import { commentsController } from "./controller.js";

const r = express.Router();

r.use(verifyToken);

r.get("/:content_id", commentsController.getComments);
r.post("/", commentsController.addComment);
r.delete("/:comment_id", commentsController.deleteComment);

export default r;
