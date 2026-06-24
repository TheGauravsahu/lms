import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import cors from "cors";
import mongoSanitize from "express-mongo-sanitize";
import hpp from "hpp";
import env from "./config/env.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { responseMiddleware } from "./middleware/response.js";
import { apiLimiter, apiSpeedLimiter } from "./middleware/security.js";
import courseRoutes from "./course/route.js";
import uploadRoutes from "./uploads/route.js";
import authRoutes from "./auth/route.js";
import purchaseRoutes from "./purchase/route.js";
import studentRoutes from "./students/route.js";
import adminRoutes from "./admin/route.js";
import progressRoutes from "./progress/route.js";
import commentRoutes from "./comments/route.js";
import reviewRoutes from "./reviews/route.js";
import quizRoutes from "./quiz/route.js";
import forumRoutes from "./forums/route.js";
import studyGroupRoutes from "./studygroups/route.js";
import peerReviewRoutes from "./peerreviews/route.js";
import announcementRoutes from "./announcements/route.js";
import productivityRoutes from "./productivity/route.js";
import searchRoutes from "./search/route.js";
import aiRoutes from "./ai/route.js";
import flashcardRoutes from "./flashcard/route.js";
import careerRoutes from "./career/route.js";
import { apiReference } from "@scalar/express-api-reference";
import { openApiSpec } from "./docs/openapi.js";
import mongoose from "mongoose";

const app = express();

app.set("trust proxy", 1);

app.use(cors({ origin: env.LMS_CLIENT_URL, credentials: true }));

// Helmet: relaxed CSP for Scalar /docs UI, strict for all other routes.
// Using a single middleware to prevent the strict helmet from overwriting the relaxed one.
app.use((req, res, next) => {
  if (req.path.startsWith("/docs")) {
    return helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: [
            "'self'",
            "'unsafe-inline'",
            "'unsafe-eval'",
            "https://cdn.jsdelivr.net",
          ],
          styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
          fontSrc: ["'self'", "data:", "https://fonts.gstatic.com"],
          imgSrc: ["'self'", "data:", "https:", "blob:"],
          connectSrc: ["'self'", "http://localhost:*", "https:"],
          workerSrc: ["'self'", "blob:"],
          frameSrc: ["'self'"],
        },
      },
    })(req, res, next);
  }
  return helmet()(req, res, next);
});
app.use(express.json({ limit: "10kb" })); // Limit JSON payload size to prevent DoS

// Workaround: Express 5 makes req.query a read-only getter.
// This redefines req.query as a mutable object copy so express-mongo-sanitize can sanitize it without throwing.
app.use((req, res, next) => {
  if (req.query) {
    Object.defineProperty(req, "query", {
      value: { ...req.query },
      writable: true,
      configurable: true,
      enumerable: true,
    });
  }
  next();
});

app.use(mongoSanitize()); // Prevent NoSQL Injection
app.use(hpp()); // Prevent HTTP Parameter Pollution
app.use(morgan("dev"));
app.use(apiLimiter); // Apply general rate limiting
app.use(apiSpeedLimiter); // Apply general response slow down
app.use(responseMiddleware);

app.use("/api/courses", courseRoutes);
app.use("/api/uploads", uploadRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/purchases", purchaseRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/quizzes", quizRoutes);
app.use("/api/forums", forumRoutes);
app.use("/api/study-groups", studyGroupRoutes);
app.use("/api/peer-reviews", peerReviewRoutes);
app.use("/api/announcements", announcementRoutes);
app.use("/api/productivity", productivityRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/flashcards", flashcardRoutes);
app.use("/api/career", careerRoutes);

// ─── API Documentation (Scalar) ───────────────────────────────────────────────
app.get("/docs/spec.json", (req, res) => res.json(openApiSpec));
app.use(
  "/docs",
  apiReference({
    theme: "kepler",
    spec: { url: "/docs/spec.json" },
    pageTitle: "Gaurav LMS API Reference",
    metaData: {
      title: "Gaurav LMS API Reference",
      description: "Interactive REST API documentation for Gaurav LMS.",
      ogTitle: "Gaurav LMS API Reference",
    },
  }),
);

app.get("/api/health", async (req, res) => {
  try {
    const dbStatus = mongoose.connection.readyState === 1 ? "Connected" : "Disconnected";
    
    res.status(200).json({
      status: "UP",
      database: dbStatus
    });
  } catch (error) {
    res.status(500).json({ status: "DOWN", error: error.message });
  }
});

app.use(errorHandler);

export default app;
