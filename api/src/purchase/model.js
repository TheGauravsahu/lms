import mongoose from "mongoose";
import { PURCHASE_STATUS } from "../utils/constants.js";

const purchaseSchema = new mongoose.Schema(
  {
    course_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "courses",
      required: true,
    },

    account_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user_accounts",
      required: true,
    },

    base_price: {
      type: Number,
      required: true,
    },

    gst_percentage: {
      type: Number,
      required: true,
    },
    gst_amount: {
      type: Number,
      required: true,
    },

    total_price: {
      type: Number,
      required: true,
    },

    status: {
      type: String,
      enum: PURCHASE_STATUS,
      default: "PENDING",
    },
  },
  { timestamps: true },
);

purchaseSchema.index({ user_id: 1, course_id: 1 }, { unique: true });

export const purchaseModel = mongoose.model("purchases", purchaseSchema);
