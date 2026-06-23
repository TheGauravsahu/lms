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

const app = express();

app.use(cors({ origin: env.LMS_CLIENT_URL, credentials: true }));
app.use(helmet());
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

app.get("/health", (req, res) =>
  res.success(200, null, "Server is running successfully."),
);

app.use(errorHandler);

export default app;
