import express from "express";
import { courseController } from "./controller.js";
import { validate } from "../middleware/validate.js";
import {
  createCourseContentSchema,
  createCourseFolderSchema,
  createCourseSchema,
  deleteCourseContentSchema,
  deleteCourseFolderSchema,
  editCourseContentSchema,
  editCourseFolderSchema,
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
r.post("/course-folders", courseController.getAllCourseFolders);
r.post(
  "/create-folder",
  validate(createCourseFolderSchema),
  courseController.createCourseFolder,
);
r.put(
  "/edit-folder",
  validate(editCourseFolderSchema),
  courseController.editCourseFolder,
);
r.delete(
  "/delete-folder",
  validate(deleteCourseFolderSchema),
  courseController.deleteCourseFolder,
);

// course_content routes
r.post("/course-contents", courseController.getAllCourseContents);
r.post(
  "/create-content",
  validate(createCourseContentSchema),
  courseController.createCourseContent,
);
r.put(
  "/edit-content",
  validate(editCourseContentSchema),
  courseController.editCourseContent,
);
r.delete(
  "/delete-content",
  validate(deleteCourseContentSchema),
  courseController.deleteCourseContent,
);

export default r;
