import express from "express";
import { flashcardController } from "./controller.js";
import { verifyToken, verifyRoles } from "../middleware/auth.js";

const r = express.Router();

r.use(verifyToken);

r.get("/", flashcardController.getSets);
r.post("/create", flashcardController.createSet);
r.delete("/:id", flashcardController.deleteSet);
r.post("/generate-ai", flashcardController.generateAiFlashcards);
r.post("/toggle-mastery", flashcardController.toggleCardMastery);

// Admin-only flashcard routes
r.get("/admin/all", verifyRoles("ADMIN"), flashcardController.adminGetAllSets);
r.delete("/admin/:id", verifyRoles("ADMIN"), flashcardController.adminDeleteSet);

export default r;
