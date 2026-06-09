import { getCache, setCache } from "../config/redis.js";
import { courseModel } from "./models/course.js";
import { courseFolderModel } from "./models/folder.js";

class CourseService {
  getAllCourses = async () => {
    const cacheKey = "courses:all";
    const cachedCourses = await getCache(cacheKey);

    if (!cachedCourses) {
      const courses = await courseModel.find();
      await setCache(cacheKey, courses, 60 * 60);
      return courses;
    }

    return cachedCourses;
  };

  getCourseDetails = async (course_id) => {
    const cacheKey = `course:${course_id}`;
    const cachedData = await getCache(cacheKey);
    if (cachedData) {
      return cachedData;
    }
    const overview = await courseModel
      .findById(course_id)
      .populate("thumbnail", "url");
    if (!overview) {
      return null;
    }

    const content = await courseFolderModel
      .find({ course_id, parent_id: null })
      .populate("thumbnail", "url");
    const data = { overview, content };
    await setCache(cacheKey, data, 60 * 60);
    return data;
  };

  searchCourse = async (q) => {
    const cacheKey = `search:${q}`;
    const cachedData = await getCache(cacheKey);

    if (!cachedData) {
      const courses = await courseModel.find({
        title: { $regex: q, $options: "i" },
      });
      await setCache(cacheKey, courses, 60 * 60);
      return courses;
    }

    return cachedData;
  };
}

export const courseService = new CourseService();
