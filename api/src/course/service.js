import { deleteCache, getCache, setCache } from "../config/redis.js";
import { courseContentModel } from "./models/content.js";
import { courseModel } from "./models/course.js";
import { courseFolderModel } from "./models/folder.js";

class CourseService {
  getAllCourses = async () => {
    const cacheKey = "courses:all";
    const cachedCourses = await getCache(cacheKey);

    if (!cachedCourses) {
      const courses = await courseModel.find().populate("thumbnail", "url");
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

  editCourseDetails = async (course_id, edit) => {
    const course = await courseModel.findById(course_id);
    if (!course) return null;

    const updatedCourse = await courseModel.findByIdAndUpdate(course_id, edit, {
      new: true,
      runValidators: true,
    });
    await deleteCache("courses:all");
    await deleteCache(`course:${course_id}`);
    return updatedCourse;
  };

  getAllCourseFolders = async (parent_id, course_id) => {
    const cacheKey = `course_folders:${course_id}:${parent_id || "root"}`;
    const cachedData = await getCache(cacheKey);
    if (cachedData) return cachedData;

    const query = {
      course_id,
      parent_id: parent_id || null,
    };
    const folders = await courseFolderModel
      .find(query)
      .populate("thumbnail", "url");

    await setCache(cacheKey, folders, 60 * 60);
    return folders;
  };

  getAllCourseContents = async (folder_id) => {
    const cacheKey = `course_contents:${folder_id}`;
    const cachedData = await getCache(cacheKey);
    if (cachedData) return cachedData;

    const contents = await courseContentModel
      .find({ folder_id })
      .populate("thumbnail content", "url");
    return contents;
  };
}

export const courseService = new CourseService();
