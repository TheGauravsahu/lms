import { asyncHandler } from "../utils/asyncHandler.js";
import { otpModel } from "./models/opt.js";
import { accountModel } from "./models/account.js";
import { ACCOUNT_STATUS } from "../utils/constants.js";

class AuthController {
  sendOtp = asyncHandler(async (req, res) => {
    const { mobile_no } = req.body;
    const otpResult = await otpModel.create({
      mobile_no,
      otp: Math.floor(100000 + Math.random() * 900000).toString(),
    });
    res.success(201, otpResult, "OTP generated successfully.");
  });

  verifyOtpAndCreateAccount = asyncHandler(async (req, res) => {
    const { mobile_no, name, otp };
    const result = await otpModel.findOne({ mobile_no, otp });
    if (!result) return res.error(401, "Unauthorized", "Invalid OTP.");

    const account = await accountModel.create({
      name,
      mobile_no,
      status: ACCOUNT_STATUS[0],
    });
    return res.success(200, account, "Account created successfully.");
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
    res.success(200, updatedAccount, "Account edited successfully");
  });
}

export const authController = new AuthController();
