import express from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { verifyToken } from "../middleware/auth.js";
import { AiChatSession, AiRoadmap } from "./model.js";
import { generateGeminiContent } from "../utils/gemini.js";

const r = express.Router();
r.use(verifyToken);

// ─────────────────────────────────────────────────────────────────────────────
// 🤖 AI TUTOR CHAT
// ─────────────────────────────────────────────────────────────────────────────

// GET /api/ai/tutor/sessions — Get user chat sessions list
r.get(
  "/tutor/sessions",
  asyncHandler(async (req, res) => {
    const userId = req.account.account_id;
    const sessions = await AiChatSession.find({ userId })
      .select("_id title lessonId createdAt updatedAt")
      .sort({ updatedAt: -1 });

    res.success(200, sessions, "Chat sessions fetched.");
  })
);

// GET /api/ai/tutor/sessions/:id — Get details of a single session
r.get(
  "/tutor/sessions/:id",
  asyncHandler(async (req, res) => {
    const userId = req.account.account_id;
    const session = await AiChatSession.findOne({ _id: req.params.id, userId });
    if (!session) {
      return res.error(404, "Not Found", "Chat session not found.");
    }
    res.success(200, session, "Chat session details fetched.");
  })
);

// DELETE /api/ai/tutor/sessions/:id — Delete a chat session
r.delete(
  "/tutor/sessions/:id",
  asyncHandler(async (req, res) => {
    const userId = req.account.account_id;
    const session = await AiChatSession.findOneAndDelete({ _id: req.params.id, userId });
    if (!session) {
      return res.error(404, "Not Found", "Chat session not found.");
    }
    res.success(200, null, "Chat session deleted.");
  })
);

// POST /api/ai/tutor/chat — Send a message (creates a session if sessionId is missing)
r.post(
  "/tutor/chat",
  asyncHandler(async (req, res) => {
    const userId = req.account.account_id;
    const { sessionId, message, lessonId, lessonTitle } = req.body;

    if (!message || !message.trim()) {
      return res.error(400, "Validation Error", "message is required.");
    }

    let session;
    if (sessionId) {
      session = await AiChatSession.findOne({ _id: sessionId, userId });
      if (!session) {
        return res.error(404, "Not Found", "Chat session not found.");
      }
    } else {
      let defaultTitle = "AI Tutor Chat";
      if (lessonTitle) {
        defaultTitle = `Lesson: ${lessonTitle}`;
      } else {
        // Snippet standard prompt summary
        defaultTitle = message.length > 30 ? message.substring(0, 27) + "..." : message;
      }

      session = await AiChatSession.create({
        userId,
        title: defaultTitle,
        lessonId: lessonId || null,
        messages: [],
      });
    }

    // Set context in system instruction
    const systemInstruction = `You are a friendly, highly knowledgeable AI software engineering tutor on Gaurav LMS.
Your goal is to guide students step-by-step, explain programming topics simply, debug code, and encourage critical thinking.
Always explain concepts with simple, well-commented code blocks (in Markdown syntax) when applicable.
${
  lessonTitle
    ? `The student is currently learning the lesson titled: "${lessonTitle}". Keep explanations contextually focused on this lesson when relevant.`
    : ""
}`;

    // Get response from Gemini
    try {
      const responseText = await generateGeminiContent(
        message,
        session.messages,
        false,
        systemInstruction
      );

      // Save messages
      session.messages.push({ role: "user", content: message });
      session.messages.push({ role: "model", content: responseText });
      await session.save();

      res.success(200, { session, reply: responseText }, "AI response generated.");
    } catch (err) {
      return res.error(500, "AI Service Error", err.message);
    }
  })
);

// ─────────────────────────────────────────────────────────────────────────────
// 📝 AI NOTES GENERATOR
// ─────────────────────────────────────────────────────────────────────────────

// POST /api/ai/notes — Create study notes from lesson
r.post(
  "/notes",
  asyncHandler(async (req, res) => {
    const { lessonTitle, context } = req.body;
    if (!lessonTitle) {
      return res.error(400, "Validation Error", "lessonTitle is required.");
    }

    const prompt = `Generate structured, concise study notes in Markdown format based on the lesson: "${lessonTitle}".
${
  context
    ? `Use the following lesson context/details to enrich the notes:\n${context}`
    : "The notes should explain the core developer concepts, list essential takeaways, and provide a clear code syntax example in a Markdown code block."
}
Format the notes professionally with clear heading structure (H2, H3), bullet points, and code snippets. Do not write a generic intro or outro.`;

    try {
      const notes = await generateGeminiContent(prompt, [], false, "You are a concise study assistant.");
      res.success(200, { notes }, "Study notes generated successfully.");
    } catch (err) {
      return res.error(500, "AI Service Error", err.message);
    }
  })
);

// ─────────────────────────────────────────────────────────────────────────────
// 🧩 AI QUIZ GENERATOR
// ─────────────────────────────────────────────────────────────────────────────

// POST /api/ai/quiz — Generate practice quiz JSON
r.post(
  "/quiz",
  asyncHandler(async (req, res) => {
    const { lessonTitle, context } = req.body;
    if (!lessonTitle) {
      return res.error(400, "Validation Error", "lessonTitle is required.");
    }

    const prompt = `Create a multiple-choice practice quiz in JSON format based on the lesson: "${lessonTitle}".
${context ? `Use the following lesson details for context:\n${context}` : ""}
The response MUST be a single, valid JSON object containing exactly 5 questions.
Use this JSON schema:
{
  "questions": [
    {
      "question": "Question text here?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "answer": "Option B", 
      "explanation": "Detailed explanation of why this option is correct."
    }
  ]
}
Do NOT return any other text, markdown blocks, or explanations. Only return the raw JSON object. Ensure all 5 items have 4 options and the "answer" matches one of the options exactly.`;

    try {
      const responseText = await generateGeminiContent(prompt, [], true, "You are a quiz generation bot. Output only raw JSON.");
      
      // Parse JSON
      let quizData;
      try {
        quizData = JSON.parse(responseText);
      } catch (jsonErr) {
        // Fallback: try to extract JSON from markdown wraps if Gemini failed config
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          quizData = JSON.parse(jsonMatch[0]);
        } else {
          throw jsonErr;
        }
      }

      res.success(200, quizData, "Quiz generated successfully.");
    } catch (err) {
      return res.error(500, "AI Service Error", err.message);
    }
  })
);

// ─────────────────────────────────────────────────────────────────────────────
// 🗺️ AI ROADMAP GENERATOR
// ─────────────────────────────────────────────────────────────────────────────

// GET /api/ai/roadmap — Fetch user saved roadmaps
r.get(
  "/roadmap",
  asyncHandler(async (req, res) => {
    const userId = req.account.account_id;
    const roadmaps = await AiRoadmap.find({ userId }).sort({ createdAt: -1 });
    res.success(200, roadmaps, "Roadmaps fetched.");
  })
);

// POST /api/ai/roadmap — Generate and save learning roadmap
r.post(
  "/roadmap",
  asyncHandler(async (req, res) => {
    const userId = req.account.account_id;
    const { goal } = req.body;

    if (!goal || !goal.trim()) {
      return res.error(400, "Validation Error", "goal is required.");
    }

    const prompt = `Create a structured learning roadmap in JSON format for the following developer goal: "${goal}".
The roadmap must start from absolute beginner prerequisites and progress logically to advanced deployment, testing, or architectures.
The response MUST be a single, valid JSON object. Use this JSON schema:
{
  "title": "Learning Roadmap for ${goal}",
  "milestones": [
    {
      "name": "Phase Name (e.g. Phase 1: Core Fundamentals)",
      "description": "Short description of what the student will achieve in this phase.",
      "topics": ["Topic 1", "Topic 2", "Topic 3"],
      "duration": "Estimated time (e.g. 2 weeks)"
    }
  ]
}
Do NOT return any other text, markdown blocks, or explanations. Only return the raw JSON object.`;

    try {
      const responseText = await generateGeminiContent(
        prompt,
        [],
        true,
        "You are a developer roadmap generator. Output only raw JSON."
      );

      let parsedRoadmap;
      try {
        parsedRoadmap = JSON.parse(responseText);
      } catch (jsonErr) {
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          parsedRoadmap = JSON.parse(jsonMatch[0]);
        } else {
          throw jsonErr;
        }
      }

      // Save to database
      const roadmapEntry = await AiRoadmap.create({
        userId,
        title: parsedRoadmap.title || `Roadmap for ${goal}`,
        goal,
        roadmapData: parsedRoadmap,
      });

      res.success(201, roadmapEntry, "Roadmap generated and saved.");
    } catch (err) {
      return res.error(500, "AI Service Error", err.message);
    }
  })
);

// DELETE /api/ai/roadmap/:id — Delete a saved roadmap
r.delete(
  "/roadmap/:id",
  asyncHandler(async (req, res) => {
    const userId = req.account.account_id;
    const roadmap = await AiRoadmap.findOneAndDelete({ _id: req.params.id, userId });
    if (!roadmap) {
      return res.error(404, "Not Found", "Roadmap not found.");
    }
    res.success(200, null, "Roadmap deleted.");
  })
);

export default r;
