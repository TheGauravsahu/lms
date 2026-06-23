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
    return res.success(200, data, "Logged in successfully.");
  });

  logoutAccount = asyncHandler(async (req, res) => {
    const accountId = req.account.account_id;
    await accountModel.findByIdAndUpdate(accountId, {
      $inc: {
        tokenVersion: 1,
      },
    });
    return res.success(200, null, "Logged out successfully");
  });

  // user_account
  getAccountDetails = asyncHandler(async (req, res) => {
    const { account_id } = req.body || req.account; // admin(body)/user(req.account)
    const account = await accountModel.findById(account_id);
    if (!account) return res.error(404, "Not Found", "Account not found.");

    // Update daily streak for USER role
    if (account.role === "USER") {
      const today = new Date().toISOString().split("T")[0];
      const lastActive = account.lastActiveDate;

      if (lastActive !== today) {
        let currentStreak = account.currentStreak || 0;
        let longestStreak = account.longestStreak || 0;

        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split("T")[0];

        if (lastActive === yesterdayStr) {
          currentStreak += 1;
        } else {
          currentStreak = 1;
        }

        if (currentStreak > longestStreak) {
          longestStreak = currentStreak;
        }

        account.currentStreak = currentStreak;
        account.longestStreak = longestStreak;
        account.lastActiveDate = today;

        // Streak badges & XP rewards
        if (currentStreak >= 3 && !account.badges.includes("Habit Builder")) {
          account.badges.push("Habit Builder");
          account.xp = (account.xp || 0) + 50;
        }
        if (currentStreak >= 7 && !account.badges.includes("Dedicated Learner")) {
          account.badges.push("Dedicated Learner");
          account.xp = (account.xp || 0) + 100;
        }
        if (currentStreak >= 30 && !account.badges.includes("Unstoppable")) {
          account.badges.push("Unstoppable");
          account.xp = (account.xp || 0) + 500;
        }

        await account.save();
        
        // Invalidate students cache
        const { deletePattern } = await import("../config/redis.js");
        await deletePattern("students:*");
        await deletePattern("gamification:*");
      }
    }

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
