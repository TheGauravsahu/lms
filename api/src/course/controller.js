import { asyncHandler } from "../utils/asyncHandler.js";
import { courseContentModel, courseFolderModel, courseModel } from "./model.js";

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

  getAllCoureses = asyncHandler((req, res) => {});

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

  // course_content
  createCourseContent = asyncHandler(async (req, res) => {
    console.log(req);
    const { folder_id, title, content_type, thumbnail, content_url } = req.body;
    const content = await courseContentModel.create({
      folder_id,
      title,
      content_type,
      content_url,
    });

    res.success(201, content, "Course content created successfully");
  });
}

export const courseController = new CourseController();
