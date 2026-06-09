import { asyncHandler } from "../utils/asyncHandler.js";
import { otpModel } from "./models/opt.js";
import { accountModel } from "./models/account.js";
import { ACCOUNT_STATUS } from "../utils/constants.js";
import jwt from "jsonwebtoken";
import env from "../config/env.js";

class AuthController {
  sendOtp = asyncHandler(async (req, res) => {
    const { mobile_no } = req.body;
    const otpResult = await otpModel.create({
      mobile_no,
      otp: Math.floor(100000 + Math.random() * 900000).toString(),
    });
    return res.success(201, otpResult, "OTP generated successfully.");
  });

  verifyOtpAndCreateAccount = asyncHandler(async (req, res) => {
    const { mobile_no, name, otp } = req.body;
    const result = await otpModel.findOne({ mobile_no, otp });
    if (!result) return res.error(401, "Unauthorized", "Invalid OTP.");
    
    const account = await accountModel.findOne({ mobile_no });
    if (account)
      return res.error(400, "Account Found", "Account already exists.");

    const data = await this.createAccountAndSignToken(name, mobile_no);
    return res.success(200, data, "Account created successfully.");
  });

  async createAccountAndSignToken(name, mobile_no) {
    const account = await accountModel.create({
      name,
      mobile_no,
      status: ACCOUNT_STATUS[0],
    });
    const token = jwt.sign(
      {
        account_id: account._id,
        name: account.name,
        role: account.role,
      },
      env.JWT_SECRET,
      { expiresIn: "7d" },
    );
    return { account, token };
  }

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
