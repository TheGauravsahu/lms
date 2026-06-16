import z from "zod";
import { PURCHASE_STATUS } from "../utils/constants.js";

export const purchaseCourseSchema = z.object({
  course_id: z.string().min(1, "course_id is required"),
});

export const editPurchaseCourseSchema = z.object({
  course_id: z.string().min(1, "course_id is required"),
  account_id: z.string().min(1, "course_id is required"),
  base_price: z.number().positive().min(0, "base_price is required"),
  gst_percentage: z.string().min(2, "gst_percentage is required"),
  gst_amount: z.number().positive().min(0, "gst_amount is required"),
  total_price: z.number().positive().min(0, "total_price is required"),
  status: z.enum(PURCHASE_STATUS),
});

export const deletePurchaseCourseSchema = z.object({
  course_id: z.string().min(1, "course_id is required"),
  account_id: z.string().min(1, "course_id is required"),
});
