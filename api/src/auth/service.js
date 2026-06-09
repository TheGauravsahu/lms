import { getCache, setCache } from "../config/redis.js";
import { accountModel } from "./model.js";
import { ACCOUNT_STATUS } from "../utils/constants.js";
import jwt from "jsonwebtoken";
import env from "../config/env.js";

class AuthService {
  sendOtp = async (mobile_no) => {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    await setCache(`otp:${mobile_no}`, otp, 300); // 5mins
    return { otp };
  };

  verifyOtp = async (mobile_no, otp) => {
    await getCache(`otp:${mobile_no}`);
    if (!storedOtp) return false;
    return true;
  };

  createAccountAndSignToken = async (name, mobile_no) => {
    const accountFound = await accountModel.findOne({ mobile_no });
    if (accountFound) return null;

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
  };
}

export const authService = new AuthService();
