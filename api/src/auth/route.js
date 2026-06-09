import express from "express";
import { authController } from "./controller.js";

const r = express.Router();

r.post("/send-otp", authController.sendOtp);
r.post("/verify-otp", authController.verifyOtpAndCreateAccount);
r.post("/account-details", authController.getAccountDetails);
r.post("/edit-account", authController.editAccountDetails);

export default r;
