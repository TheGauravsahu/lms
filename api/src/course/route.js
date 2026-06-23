import express from "express";
import { courseController } from "./controller.js";
import { validate } from "../middleware/validate.js";
import {
  createCourseContentSchema,
  createCourseFolderSchema,
  createCourseSchema,
  deleteCourseContentSchema,
  deleteCourseSchema,
  deleteCourseFolderSchema,
  editCourseContentSchema,
  editCourseFolderSchema,
  editCourseSchema,
} from "../schemas/course.js";
import { verifyRoles, verifyToken } from "../middleware/auth.js";

const r = express.Router();

// Public routes
r.post("/course-details", courseController.getCourseDetails);
r.get("/all-courses", courseController.getAllCourses);
r.get("/search-course", courseController.searchCourse);

// Authenticated routes
r.post("/course-folders", verifyToken, courseController.getAllCourseFolders);
r.post("/course-contents", verifyToken, courseController.getAllCourseContents);

// Admin-only write routes
r.post(
  "/create-course",
  verifyToken,
  verifyRoles("ADMIN"),
  validate(createCourseSchema),
  courseController.createCourse,
);

r.put(
  "/edit-course",
  verifyToken,
  verifyRoles("ADMIN"),
  validate(editCourseSchema),
  courseController.editCourseDetails,
);

r.delete(
  "/delete-course",
  verifyToken,
  verifyRoles("ADMIN"),
  validate(deleteCourseSchema),
  courseController.deleteCourse,
);

// course_folders routes
r.post(
  "/create-folder",
  verifyToken,
  verifyRoles("ADMIN"),
  validate(createCourseFolderSchema),
  courseController.createCourseFolder,
);
r.put(
  "/edit-folder",
  verifyToken,
  verifyRoles("ADMIN"),
  validate(editCourseFolderSchema),
  courseController.editCourseFolder,
);
r.delete(
  "/delete-folder",
  verifyToken,
  verifyRoles("ADMIN"),
  validate(deleteCourseFolderSchema),
  courseController.deleteCourseFolder,
);

// course_content routes
r.post(
  "/create-content",
  verifyToken,
  verifyRoles("ADMIN"),
  validate(createCourseContentSchema),
  courseController.createCourseContent,
);
r.put(
  "/edit-content",
  verifyToken,
  verifyRoles("ADMIN"),
  validate(editCourseContentSchema),
  courseController.editCourseContent,
);
r.post(
  "/delete-content",
  verifyToken,
  verifyRoles("ADMIN"),
  validate(deleteCourseContentSchema),
  courseController.deleteCourseContent,
);

export default r;
