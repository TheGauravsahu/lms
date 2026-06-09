import express from "express";
import { courseController } from "./controller.js";
import { validate } from "../middleware/validate.js";
import { createCourseSchema, editCourseSchema } from "../schemas/course.js";

const r = express.Router();

r.post(
  "/create-course",
  validate(createCourseSchema),
  courseController.createCourse,
);
r.put(
  "/edit-course",
  validate(editCourseSchema),
  courseController.editCourseDetails,
);
r.post("/course-details", courseController.getCourseDetails);
r.get("/all-courses", courseController.getAllCourses);
r.get("/search-course", courseController.searchCourse);

// course_foders routes
r.post("/create-folder", courseController.createCourseFolder);
r.post("/course-folders", courseController.getAllCourseFolders);

// course_content routes
r.post("/create-content", courseController.createCourseContent);
r.post("/course-contents", courseController.getAllCourseContents);

export default r;
