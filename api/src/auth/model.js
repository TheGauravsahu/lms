import mongoose from "mongoose";
import { ACCOUNT_ROLES, ACCOUNT_STATUS } from "../utils/constants.js";

const accountSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    mobile_no: {
      type: String,
      required: true,
      unique: true,
    },
    email: String,
    status: {
      type: String,
      enum: ACCOUNT_STATUS,
      default: "UNVERIFIED",
    },
    role: {
      type: String,
      enum: ACCOUNT_ROLES,
      default: "USER",
    },
    tokenVersion: {
      type: Number,
      default: 0,
    },
    xp: {
      type: Number,
      default: 0,
    },
    badges: {
      type: [String],
      default: [],
    },
    currentStreak: {
      type: Number,
      default: 0,
    },
    longestStreak: {
      type: Number,
      default: 0,
    },
    lastActiveDate: {
      type: String,
      default: null,
    },
  },
  { timestamps: true },
);

export const accountModel = mongoose.model("user_accounts", accountSchema);
