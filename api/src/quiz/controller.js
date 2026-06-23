import { quizModel } from "./model.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const quizController = {
  // Create a new Quiz
  createQuiz: asyncHandler(async (req, res) => {
    const { title, questions } = req.body;

    if (!title || !Array.isArray(questions) || questions.length === 0) {
      return res.error(400, "Bad Request", "Title and a non-empty questions array are required.");
    }

    // Validate questions structure
    for (const q of questions) {
      if (!q.question || !Array.isArray(q.options) || q.options.length < 2 || !q.correctAnswer) {
        return res.error(400, "Bad Request", "Each question must have a title, at least 2 options, and a correctAnswer.");
      }
    }

    const quiz = await quizModel.create({ title, questions });
    res.success(201, quiz, "Quiz created successfully.");
  }),

  // Get all Quizzes
  getAllQuizzes: asyncHandler(async (req, res) => {
    const quizzes = await quizModel.find().sort({ createdAt: -1 });
    res.success(200, quizzes, "Quizzes fetched successfully.");
  }),

  // Get Quiz by ID
  getQuizDetails: asyncHandler(async (req, res) => {
    const { quiz_id } = req.params;
    const quiz = await quizModel.findById(quiz_id);
    if (!quiz) {
      return res.error(404, "Not Found", "Quiz not found.");
    }
    res.success(200, quiz, "Quiz details fetched successfully.");
  }),

  // Update Quiz
  updateQuiz: asyncHandler(async (req, res) => {
    const { quiz_id } = req.params;
    const { title, questions } = req.body;

    if (!title || !Array.isArray(questions) || questions.length === 0) {
      return res.error(400, "Bad Request", "Title and a non-empty questions array are required.");
    }

    // Validate questions structure
    for (const q of questions) {
      if (!q.question || !Array.isArray(q.options) || q.options.length < 2 || !q.correctAnswer) {
        return res.error(400, "Bad Request", "Each question must have a title, at least 2 options, and a correctAnswer.");
      }
    }

    const quiz = await quizModel.findByIdAndUpdate(
      quiz_id,
      { title, questions },
      { new: true, runValidators: true }
    );

    if (!quiz) {
      return res.error(404, "Not Found", "Quiz not found.");
    }

    res.success(200, quiz, "Quiz updated successfully.");
  }),

  // Delete Quiz
  deleteQuiz: asyncHandler(async (req, res) => {
    const { quiz_id } = req.params;
    const quiz = await quizModel.findByIdAndDelete(quiz_id);
    if (!quiz) {
      return res.error(404, "Not Found", "Quiz not found.");
    }
    res.success(200, null, "Quiz deleted successfully.");
  }),
};
