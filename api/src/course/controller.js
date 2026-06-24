import { asyncHandler } from "../utils/asyncHandler.js";
import { courseModel } from "./models/course.js";
import { courseFolderModel } from "./models/folder.js";
import { courseContentModel } from "./models/content.js";
import { courseService } from "./service.js";

class CourseController {
  createCourse = asyncHandler(async (req, res) => {
    const course = await courseService.createCourse(req.body);
    res.success(201, course, "Course created successfully");
  });

  getAllCourses = asyncHandler(async (req, res) => {
    const { page, limit, search, filter } = req.query;
    const data = await courseService.getAllCourses({ page, limit, search, filter });
    res.success(200, data, "Courses fetched successfully");
  });

  getCourseDetails = asyncHandler(async (req, res) => {
    const { course_id } = req.body;
    const data = await courseService.getCourseDetails(course_id);
    if (!data.overview) return res.error(404, "Not Found", "Course not found");

    res.success(200, data, "Course details fetched successfully.");
  });

  editCourseDetails = asyncHandler(async (req, res) => {
    const { course_id, edit } = req.body;
    const course = await courseService.editCourseDetails(course_id, edit);
    if (!course) return res.error(404, "Not found", "Course Not found");
    res.success(200, course, "Course edited successfully");
  });

  deleteCourse = asyncHandler(async (req, res) => {
    const { course_id } = req.body;
    const result = await courseService.deleteCourse(course_id);
    if (!result) return res.error(404, "Not Found", "Course not found");
    res.success(200, null, "Course deleted successfully");
  });

  searchCourse = asyncHandler(async (req, res) => {
    const { q = "" } = req.query;
    const courses = await courseService.searchCourse(q);
    res.success(200, courses, "Courses searched successfully");
  });

  // course_folders
  createCourseFolder = asyncHandler(async (req, res) => {
    const folder = await courseService.createCourseFolder(req.body);
    res.success(201, folder, "Course folder created successfully");
  });

  getAllCourseFolders = asyncHandler(async (req, res) => {
    const { parent_id, course_id } = req.body;
    const folders = await courseService.getAllCourseFolders(
      parent_id,
      course_id,
    );
    res.success(200, folders, "Course folders fetched successfully");
  });

  editCourseFolder = asyncHandler(async (req, res) => {
    const { course_id, parent_id, title, thumbnail } = req.body;
    const folder = await courseService.editCourseFolder(
      course_id,
      parent_id,
      title,
      thumbnail,
    );
    if (!folder) return res.error(404, "Not Found", "Course Folder not found.");
    res.success(200, folder, "Course folder edited successfully");
  });

  deleteCourseFolder = asyncHandler(async (req, res) => {
    const { course_id, parent_id } = req.body;
    const result = await courseService.deleteCourseFolder(course_id, parent_id);
    if (!result) return res.error(404, "Not Found", "Course Folder not found.");
    res.success(200, null, "Course folder deleted successfully");
  });

  // course_content
  createCourseContent = asyncHandler(async (req, res) => {
    const data = await courseService.createCourseContent(req.body);
    res.success(201, data, "Course content created successfully");
  });

  getAllCourseContents = asyncHandler(async (req, res) => {
    const { folder_id } = req.body;
    const contents = await courseService.getAllCourseContents(folder_id);
    res.success(200, contents, "Course contents fetched successfully");
  });

  editCourseContent = asyncHandler(async (req, res) => {
    const content = await courseService.editCourseContent(req.body);
    if (!content)
      return res.error(404, "Not Found", "Course content not found");
    return res.success(200, content, "Course content edited successfully.");
  });

  deleteCourseContent = asyncHandler(async (req, res) => {
    const result = await courseService.deleteCourseContent(req.body.folder_id);
    if (!result) return res.error(404, "Not Found", "Course content not found");
    return res.success(200, null, "Course content deleted successfully.");
  });
}

export const courseController = new CourseController();
