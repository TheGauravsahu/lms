import express from "express";
import { flashcardController } from "./controller.js";
import { verifyToken } from "../middleware/auth.js";

const r = express.Router();

r.use(verifyToken);

r.get("/", flashcardController.getSets);
r.post("/create", flashcardController.createSet);
r.delete("/:id", flashcardController.deleteSet);
r.post("/generate-ai", flashcardController.generateAiFlashcards);
r.post("/toggle-mastery", flashcardController.toggleCardMastery);

export default r;
