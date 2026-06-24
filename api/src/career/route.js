import express from "express";
import { careerController } from "./controller.js";
import { verifyToken, verifyRoles } from "../middleware/auth.js";

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

// Admin-only career routes
r.post("/admin/jobs", verifyRoles("ADMIN"), careerController.adminCreateJob);
r.delete("/admin/jobs/:id", verifyRoles("ADMIN"), careerController.adminDeleteJob);
r.get("/admin/interviews", verifyRoles("ADMIN"), careerController.adminGetInterviews);

export default r;
