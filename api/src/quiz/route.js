import express from "express";
import { verifyToken, verifyRoles } from "../middleware/auth.js";
import { quizController } from "./controller.js";

const r = express.Router();

r.use(verifyToken);

// Read Quiz lists and details
r.get("/", quizController.getAllQuizzes);
r.get("/:quiz_id", quizController.getQuizDetails);

// Admin-only write routes
r.post("/", verifyRoles("ADMIN"), quizController.createQuiz);
r.put("/:quiz_id", verifyRoles("ADMIN"), quizController.updateQuiz);
r.delete("/:quiz_id", verifyRoles("ADMIN"), quizController.deleteQuiz);

export default r;
