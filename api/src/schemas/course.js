import { CONTENT_TYPE, COURSE_STATUS } from "../utils/constants.js";
import z from "zod";

export const createCourseSchema = z.object({
  title: z.string().min(3, "title is required"),
  thumbnail: z.string().min(3, "thumbnail is required"),
  validity: z.number().positive(),
  offer_price: z.number().min(0, "offer_price is required"),
  original_price: z.number().min(0, "original_price is required"),
  status: z.enum(COURSE_STATUS),
});

export const editCourseSchema = z.object({
  course_id: z.string().min(1, "course_id is required"),
  edit: z.object({
    title: z.string().min(3, "title is required"),
    thumbnail: z.string().min(3, "thumbnail is required"),

    validity: z.number().positive(),
    offer_price: z.number().min(0),
    original_price: z.number().min(0),

    status: z.enum(COURSE_STATUS),
    is_trending: z.boolean(),
    is_new: z.boolean(),
    is_featured: z.boolean(),
  }),
});



// course folder
export const createCourseFolderSchema = z.object({
  course_id: z.string().min(1, "course_id is required"),
  parent_id: z.string().min(1, "parent_id is required").optional(),
  title: z.string().min(1, "title is required"),
  thumbnail: z.string().min(1, "thumbnail is required"),
});

export const editCourseFolderSchema = z.object({
  course_id: z.string().min(1, "course_id is required"),
  parent_id: z.string().min(1, "parent_id is required").optional(),
  title: z.string().min(1, "title is required").optional(),
  thumbnail: z.string().min(1, "thumbnail is required").optional(),
});

export const deleteCourseFolderSchema = z.object({
  course_id: z.string().min(1, "course_id is required"),
  parent_id: z.string().min(1, "parent_id is required").optional(),
});

// course content
export const createCourseContentSchema = z.object({
  folder_id: z.string().min(1, "course_id is required"),
  title: z.string().min(1, "title is required"),
  thumbnail: z.string().min(1, "thumbnail is required").optional(),
  content: z.string().min(1, "thumbnail is required"),
  content_type: z.enum(CONTENT_TYPE),
});

export const editCourseContentSchema = z.object({
  folder_id: z.string().min(1, "course_id is required"),
  title: z.string().min(1, "title is required").optional(),
  thumbnail: z.string().min(1, "thumbnail is required").optional(),
  content: z.string().min(1, "thumbnail is required").optional(),
  content_type: z.enum(CONTENT_TYPE).optional(),
});

export const deleteCourseContentSchema = z.object({
  folder_id: z.string().min(1, "course_id is required"),
});
