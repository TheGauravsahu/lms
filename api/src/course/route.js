import express from "express";
import { courseController } from "./controller.js";

const r = express.Router();

r.post("/create-course", courseController.createCourse);

// course_foders routes
r.post("/create-folder", courseController.createCourseFolder);

// course_content routes
r.post("/create-content", courseController.createCourseContent);

export default r;
