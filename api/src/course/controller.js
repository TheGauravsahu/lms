import { asyncHandler } from "../utils/asyncHandler.js";
import { courseModel } from "./models/course.js";
import { courseFolderModel } from "./models/folder.js";
import { courseContentModel } from "./models/content.js";

class CourseController {
  createCourse = asyncHandler(async (req, res) => {
    const { title, validity, offer_price, original_price, status, thumbnail } =
      req.body;

    const course = await courseModel.create({
      title,
      thumbnail,
      validity,
      offer_price,
      original_price,
      status,
    });
    res.success(201, course, "Course created successfully");
  });

  getAllCourses = asyncHandler(async (req, res) => {
    const data = await courseModel.find();
    res.success(200, data, "Courses fetched successfully");
  });

  getCourseDetails = asyncHandler(async (req, res) => {
    const { course_id } = req.body;
    const overview = await courseModel
      .findById(course_id)
      .populate("thumbnail", "url");
    if (!overview) {
      return res.error(404, "Course not found");
    }

    const content = await courseFolderModel
      .find({ course_id, parent_id: null })
      .populate("thumbnail", "url");

    const data = { overview, content };
    res.success(200, data, "Course details fetched successfully.");
  });

  editCourseDetails = asyncHandler(async (req, res) => {
    const { course_id, edit } = req.body;
    const course = await courseModel.findById(course_id);
    if (!course) return res.error(404, null, "Course Not found");

    const updatedCourse = await courseModel.findByIdAndUpdate(course_id, edit, {
      new: true,
      runValidators: true,
    });
    res.success(200, updatedCourse, "Course edited successfully");
  });

  searchCourse = asyncHandler(async (req, res) => {
    const { q = "" } = req.query;
    const courses = await courseModel.find({
      title: { $regex: q, $options: "i" },
    });
    res.success(200, courses, "Courses fetched successfully");
  });

  // course_folders
  createCourseFolder = asyncHandler(async (req, res) => {
    const { course_id, parent_id, title, thumbnail } = req.body;

    const folder = await courseFolderModel.create({
      course_id,
      parent_id,
      title,
      thumbnail,
    });
    res.success(201, folder, "Course folder created successfully");
  });

  getAllCourseFolders = asyncHandler(async (req, res) => {
    const { parent_id, course_id } = req.body;
    let folders;
    if (parent_id) {
      folders = await courseFolderModel
        .find({ parentId, course_id })
        .populate("thumbnail", "url");
    }
    folders = await courseFolderModel
      .find({ course_id })
      .populate("thumbnail", "url");
    res.success(200, folders, "Course folders fetched successfully");
  });

  // course_content
  createCourseContent = asyncHandler(async (req, res) => {
    const { folder_id, title, content_type, thumbnail, content } = req.body;
    const data = await courseContentModel.create({
      folder_id,
      title,
      content_type,
      content,
    });

    res.success(201, data, "Course content created successfully");
  });

  getAllCourseContents = asyncHandler(async (req, res) => {
    const { folder_id } = req.body;
    const contents = await courseContentModel
      .find({ folder_id })
      .populate("thumbnail content", "url");

    res.success(200, contents, "Course contents fetched successfully");
  });
}

export const courseController = new CourseController();
