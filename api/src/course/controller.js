import { asyncHandler } from "../utils/asyncHandler.js";
import { courseModel } from "./model.js";

class CourseController {
  createCourse = asyncHandler(async (req, res) => {
    const { title, validity, offer_price, original_price, status } = req.body;
    console.log(req)
    const thumbnail = req.thumbnail_url;

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
}

export const courseController = new CourseController();
