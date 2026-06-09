import { asyncHandler } from "../utils/asyncHandler.js";
import { accountModel } from "./model.js";
import { authService } from "./service.js";

class AuthController {
  sendOtp = asyncHandler(async (req, res) => {
    const otpResult = await authService.sendOtp(req.body.mobile_no);
    return res.success(201, otpResult, "OTP generated successfully.");
  });

  verifyOtpAndCreateAccount = asyncHandler(async (req, res) => {
    const { mobile_no, name, otp } = req.body;
    const result = await authService.verifyOtp(mobile_no, otp);
    if (!result) return res.error(401, "Unauthorized", "Invalid OTP.");

    const data = await authService.createAccountAndSignToken(name, mobile_no);
    if (!data)
      return res.error(400, "Account Found", "Account already exists.");
    return res.success(200, data, "Account created successfully.");
  });

  // user_account
  getAccountDetails = asyncHandler(async (req, res) => {
    const { account_id } = req.body;
    const account = await accountModel.findById(account_id);
    if (!account) return res.error(404, "Unauthorized", "Account not found.");
    return res.success(200, account, "Account details fetched successfully.");
  });

  editAccountDetails = asyncHandler(async (req, res) => {
    const { account_id, edit } = req.body;
    const account = await accountModel.findById(account_id);
    if (!account) return res.error(404, "Unauthorized", "Account not found.");

    const updatedAccount = await accountModel.findByIdAndUpdate(
      account_id,
      edit,
      { new: true, runValidators: true },
    );
    return res.success(200, updatedAccount, "Account edited successfully");
  });
}

export const authController = new AuthController();
