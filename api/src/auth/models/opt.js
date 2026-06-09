import mongoose, { Mongoose } from "mongoose";

const otpSchema = new mongoose.Schema(
  {
    mobile_no: {
      type: String,
      required: true,
    },
    otp: {
      type: String,
      required: true,
    },
  },
  { timestamps: true },
);

export const otpModel = mongoose.model("account_otps", otpSchema);
