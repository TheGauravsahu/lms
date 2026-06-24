import express from "express";
import { careerController } from "./controller.js";
import { verifyToken } from "../middleware/auth.js";

const r = express.Router();

// Public route
r.get("/profile/public/:username", careerController.getPublicProfile);

// Protected routes
r.use(verifyToken);

r.get("/profile", careerController.getProfile);
r.put("/profile", careerController.updateProfile);
r.get("/jobs", careerController.getJobs);
r.post("/interview/start", careerController.startMockInterview);
r.get("/interview/active", careerController.getActiveInterview);
r.post("/interview/respond", careerController.submitInterviewResponse);
r.get("/interview/history", careerController.getInterviewsHistory);

export default r;
