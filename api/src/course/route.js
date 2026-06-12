import express from "express";
import { courseController } from "./controller.js";
import { validate } from "../middleware/validate.js";
import {
  createCourseContentSchema,
  createCourseFolderSchema,
  createCourseSchema,
  editCourseSchema,
} from "../schemas/course.js";
import { verifyRoles, verifyToken } from "../middleware/auth.js";

const r = express.Router();
// r.use(verifyToken);

r.post(
  "/create-course",
  // verifyRoles("ADMIN"),
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
r.post(
  "/create-folder",
  validate(createCourseFolderSchema),
  courseController.createCourseFolder,
);
r.post("/course-folders", courseController.getAllCourseFolders);

// course_content routes
r.post(
  "/create-content",
  validate(createCourseContentSchema),
  courseController.createCourseContent,
);
r.post("/course-contents", courseController.getAllCourseContents);

export default r;
