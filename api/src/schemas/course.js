import { COURSE_STATUS } from "../utils/constants.js";
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
