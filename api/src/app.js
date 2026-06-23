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
import { apiReference } from "@scalar/express-api-reference";
import { openApiSpec } from "./docs/openapi.js";

const app = express();

app.use(cors({ origin: env.LMS_CLIENT_URL, credentials: true }));

// Relax CSP for Scalar docs route only
app.use("/docs", (req, res, next) =>
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://cdn.jsdelivr.net", "https://scalar.com"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'", "http://localhost:*"],
        workerSrc: ["'self'", "blob:"],
      },
    },
  })(req, res, next)
);
app.use(helmet()); // strict helmet for all other routes
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

app.get("/health", (req, res) =>
  res.success(200, null, "Server is running successfully."),
);

app.use(errorHandler);

export default app;
