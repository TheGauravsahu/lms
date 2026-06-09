import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import { errorHandler } from "./middleware/errorHandler.js";
import { responseMiddleware } from "./middleware/response.js";
import courseRoutes from "./course/route.js";
import uploadRoutes from "./uploads/route.js";
import authRoutes from "./auth/route.js";

const app = express();

app.use(express.json());
app.use(morgan("dev"));
app.use(helmet());
app.use(responseMiddleware);

app.use("/api/courses", courseRoutes);
app.use("/api/uploads", uploadRoutes);
app.use("/api/auth", authRoutes);

app.use(errorHandler);

export default app;