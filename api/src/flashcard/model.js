import mongoose from "mongoose";

const cardSchema = new mongoose.Schema({
  question: { type: String, required: true },
  answer: { type: String, required: true },
  difficulty: { type: String, enum: ["EASY", "MEDIUM", "HARD"], default: "MEDIUM" },
  isMastered: { type: Boolean, default: false },
});

const flashcardSetSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    title: { type: String, required: true },
    description: { type: String, default: "" },
    cards: [cardSchema],
  },
  { timestamps: true }
);

export const flashcardSetModel = mongoose.model("flashcard_sets", flashcardSetSchema);
