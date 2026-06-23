import mongoose from "mongoose";

// AI Chat Session Schema (Tutor History)
const aiChatSessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user_accounts",
      required: true,
      index: true,
    },
    title: {
      type: String,
      default: "New Chat Session",
      trim: true,
    },
    messages: [
      {
        role: {
          type: String,
          enum: ["user", "model"],
          required: true,
        },
        content: {
          type: String,
          required: true,
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    lessonId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "course_contents",
      default: null,
    },
  },
  { timestamps: true }
);

// AI Learning Roadmap Schema
const aiRoadmapSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user_accounts",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    goal: {
      type: String,
      required: true,
      trim: true,
    },
    roadmapData: {
      type: mongoose.Schema.Types.Mixed, // Stores the structured JSON milestones hierarchy
      required: true,
    },
  },
  { timestamps: true }
);

export const AiChatSession = mongoose.model("ai_chat_sessions", aiChatSessionSchema);
export const AiRoadmap = mongoose.model("ai_roadmaps", aiRoadmapSchema);
