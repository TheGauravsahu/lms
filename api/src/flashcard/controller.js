import { asyncHandler } from "../utils/asyncHandler.js";
import { flashcardSetModel } from "./model.js";
import { generateGeminiContent } from "../utils/gemini.js";

class FlashcardController {
  getSets = asyncHandler(async (req, res) => {
    const userId = req.account.account_id;
    const sets = await flashcardSetModel.find({ user_id: userId }).sort({ createdAt: -1 });
    res.success(200, sets, "Flashcard sets fetched successfully");
  });

  createSet = asyncHandler(async (req, res) => {
    const userId = req.account.account_id;
    const { title, description, cards } = req.body;

    if (!title || !cards || !Array.isArray(cards) || cards.length === 0) {
      return res.error(400, "Validation Error", "Title and at least one card are required.");
    }

    const set = await flashcardSetModel.create({
      user_id: userId,
      title,
      description: description || "",
      cards,
    });

    res.success(201, set, "Flashcard set created successfully");
  });

  deleteSet = asyncHandler(async (req, res) => {
    const userId = req.account.account_id;
    const { id } = req.params;

    const set = await flashcardSetModel.findOneAndDelete({ _id: id, user_id: userId });
    if (!set) {
      return res.error(404, "Not Found", "Flashcard set not found.");
    }

    res.success(200, null, "Flashcard set deleted successfully");
  });

  generateAiFlashcards = asyncHandler(async (req, res) => {
    const userId = req.account.account_id;
    const { topic } = req.body;

    if (!topic || !topic.trim()) {
      return res.error(400, "Validation Error", "topic is required.");
    }

    const systemInstruction = `You are a helpful software engineering learning assistant on Gaurav LMS.
Your task is to generate a comprehensive list of flashcards based on the user's requested topic.
You must output a single JSON object matching this schema exactly:
{
  "title": "Short title for the flashcard deck",
  "description": "Brief description of the deck coverage",
  "cards": [
    {
      "question": "Concisely worded study question or concept term",
      "answer": "Accurate, concise, and clear definition or answer",
      "difficulty": "EASY" | "MEDIUM" | "HARD"
    }
  ]
}
Generate between 5 to 10 high-quality cards. Do not output any markup prefix, markdown block formatting (like \`\`\`json), or whitespace wrapping. Just output raw valid JSON.`;

    const prompt = `Generate a flashcard deck for the topic: "${topic}"`;

    try {
      const responseText = await generateGeminiContent(prompt, [], true, systemInstruction);
      const parsedData = JSON.parse(responseText);

      if (!parsedData.title || !parsedData.cards || !Array.isArray(parsedData.cards)) {
        throw new Error("Invalid response format received from AI.");
      }

      // Create the set in DB automatically
      const set = await flashcardSetModel.create({
        user_id: userId,
        title: parsedData.title,
        description: parsedData.description || `Generated flashcards about ${topic}`,
        cards: parsedData.cards.map((c) => ({
          question: c.question,
          answer: c.answer,
          difficulty: c.difficulty || "MEDIUM",
          isMastered: false,
        })),
      });

      res.success(201, set, "AI Flashcards generated and saved successfully.");
    } catch (err) {
      console.error("AI Flashcard Generation Error:", err);
      res.error(500, "AI Service Error", err.message || "Failed to generate AI flashcards.");
    }
  });

  toggleCardMastery = asyncHandler(async (req, res) => {
    const userId = req.account.account_id;
    const { setId, cardId } = req.body;

    const set = await flashcardSetModel.findOne({ _id: setId, user_id: userId });
    if (!set) return res.error(404, "Not Found", "Flashcard set not found.");

    const card = set.cards.id(cardId);
    if (!card) return res.error(404, "Not Found", "Flashcard item not found.");

    card.isMastered = !card.isMastered;
    await set.save();

    res.success(200, set, "Card mastery toggled.");
  });
}

export const flashcardController = new FlashcardController();
