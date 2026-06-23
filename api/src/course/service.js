import { deleteCache, getCache, setCache, deletePattern } from "../config/redis.js";
import { courseContentModel } from "./models/content.js";
import { courseModel } from "./models/course.js";
import { courseFolderModel } from "./models/folder.js";

class CourseService {
  getAllCourses = async (options = {}) => {
    const { page, limit, search, filter } = options;

    if (!page && !limit && !search && !filter) {
      const cacheKey = "courses:all";
      const cachedCourses = await getCache(cacheKey);

      if (cachedCourses) return cachedCourses;

      const courses = await courseModel.find().populate("thumbnail", "url");
      await setCache(cacheKey, courses, 60 * 60);
      return courses;
    }

    const p = Number(page) || 1;
    const l = Number(limit) || 12;
    const skip = (p - 1) * l;

    // Build query
    let query = {};
    if (search) {
      query.title = { $regex: search, $options: "i" };
    }
    if (filter === "trending") {
      query.is_trending = true;
    } else if (filter === "new") {
      query.is_new = true;
    } else if (filter === "featured") {
      query.is_featured = true;
    }

    const cacheKey = `courses:page:${p}:limit:${l}:search:${search || ""}:filter:${filter || ""}`;
    const cachedData = await getCache(cacheKey);
    if (cachedData) return cachedData;

    const [courses, total] = await Promise.all([
      courseModel.find(query)
        .populate("thumbnail", "url")
        .skip(skip)
        .limit(l),
      courseModel.countDocuments(query),
    ]);

    const result = { courses, total, page: p, limit: l };
    await setCache(cacheKey, result, 300); // 5 minutes TTL
    return result;
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
    await deletePattern("courses:*");
    await deleteCache(`course:${course_id}`);
    return updatedCourse;
  };

  // course_folder
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

  createCourseFolder = async ({ course_id, parent_id, title, thumbnail }) => {
    const cacheKey = `course_folders:${course_id}:${parent_id || "root"}`;
    const folder = await courseFolderModel.create({
      course_id,
      parent_id,
      title,
      thumbnail,
    });
    await deleteCache(cacheKey);
    return folder;
  };

  editCourseFolder = async (course_id, parent_id, title, thumbnail) => {
    const cacheKey = `course_folders:${course_id}:${parent_id || "root"}`;
    const folder = await courseFolderModel.findOne({
      course_id,
      parent_id,
    });
    if (!folder) return null;

    const updatedFolder = await courseFolderModel.findByIdAndUpdate(
      folder._id,
      { title, thumbnail },
      { new: true, runValidators: true },
    );
    await deleteCache(cacheKey);
    return updatedFolder;
  };

  deleteCourseFolder = async (course_id, parent_id) => {
    const cacheKey = `course_folders:${course_id}:${parent_id || "root"}`;
    const folder = await courseFolderModel.findOne({
      course_id,
      parent_id,
    });
    if (!folder) return false;

    await courseFolderModel.findByIdAndDelete(folder._id);
    await deleteCache(cacheKey);
    return true;
  };

  // course_content
  getAllCourseContents = async (folder_id) => {
    const cacheKey = `course_contents:${folder_id}`;
    const cachedData = await getCache(cacheKey);
    if (cachedData) return cachedData;

    const contents = await courseContentModel
      .find({ folder_id })
      .populate("thumbnail content", "url")
      .populate("quiz_id");
    return contents;
  };

  createCourseContent = async ({
    folder_id,
    title,
    content_type,
    thumbnail,
    content,
    quiz_id,
  }) => {
    const cacheKey = `course_contents:${folder_id}`;
    const data = await courseContentModel.create({
      folder_id,
      title,
      content_type,
      thumbnail: thumbnail || null,
      content,
      quiz_id: quiz_id || null,
    });
    await deleteCache(cacheKey);
    return data;
  };

  editCourseContent = async ({
    folder_id,
    title,
    content_type,
    thumbnail,
    content,
    quiz_id,
  }) => {
    const cacheKey = `course_contents:${folder_id}`;
    const course_content = await courseContentModel.findOne({ folder_id });
    if (!course_content) return null;

    const updatedCourseContent = await courseContentModel.findByIdAndUpdate(
      course_content._id,
      { title, content_type, thumbnail, content, quiz_id },
      { new: true, runValidators: true },
    );

    await deleteCache(cacheKey);
    return updatedCourseContent;
  };

  deleteCourseContent = async (folder_id) => {
    const cacheKey = `course_contents:${folder_id}`;
    const content = await courseContentModel.findOne({ folder_id });
    if (!content) return false;
    await courseContentModel.findByIdAndDelete(content._id);
    await deleteCache(cacheKey);
    return true;
  };

  deleteCourse = async (course_id) => {
    const course = await courseModel.findById(course_id);
    if (!course) return false;
    // cascade delete folders and contents
    const folders = await courseFolderModel.find({ course_id });
    for (const folder of folders) {
      await courseContentModel.deleteMany({ folder_id: folder._id });
      await deleteCache(`course_contents:${folder._id}`);
    }
    await courseFolderModel.deleteMany({ course_id });
    await courseModel.findByIdAndDelete(course_id);
    await deletePattern("courses:*");
    await deleteCache(`course:${course_id}`);
    return true;
  };
}

export const courseService = new CourseService();
