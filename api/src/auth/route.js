import express from "express";
import { authController } from "./controller.js";
import { loginSchema, verifyOtpSchema } from "../schemas/auth.js";
import { validate } from "../middleware/validate.js";

const r = express.Router();

r.post("/send-otp", validate(loginSchema), authController.sendOtp);
r.post(
  "/verify-otp",
  validate(verifyOtpSchema),
  authController.verifyOtpAndCreateAccount,
);
r.post("/account-details", authController.getAccountDetails);
r.post("/edit-account", authController.editAccountDetails);

export default r;
