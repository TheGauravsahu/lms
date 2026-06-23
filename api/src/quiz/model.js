import mongoose from "mongoose";

const questionSchema = new mongoose.Schema({
  question: { type: String, required: true },
  options: { type: [String], required: true },
  correctAnswer: { type: String, required: true },
  explanation: { type: String, default: "" },
});

const quizSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    questions: [questionSchema],
  },
  { timestamps: true }
);

export const quizModel = mongoose.model("Quiz", quizSchema);
