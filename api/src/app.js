import express from "express";
import { errorHandler } from "./middleware/errorHandler.js";
import { responseMiddleware } from "./middleware/response.js";
import courseRoutes from "./course/route.js";
import uploadRoutes from "./uploads/route.js";

const app = express();

app.use(express.json());
app.use(responseMiddleware);

app.use("/api/courses", courseRoutes);
app.use("/api/uploads", uploadRoutes);

app.use(errorHandler);

export default app;
