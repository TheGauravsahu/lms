import express from "express";
import { authController } from "./controller.js";
import { loginSchema, verifyOtpSchema } from "../schemas/auth.js";
import { validate } from "../middleware/validate.js";
import { authLimiter, authSpeedLimiter } from "../middleware/security.js";
import { verifyToken } from "../middleware/auth.js";

const r = express.Router();

r.post(
  "/send-otp",
  authSpeedLimiter,
  authLimiter,
  validate(loginSchema),
  authController.sendOtp,
);
r.post(
  "/verify-otp",
  authSpeedLimiter,
  authLimiter,
  validate(verifyOtpSchema),
  authController.verifyOtpAndCreateAccount,
);
r.post("/account-details", verifyToken, authController.getAccountDetails);
r.post("/edit-account", verifyToken, authController.editAccountDetails);

export default r;
