import asyncHandler from "../utils/asyncHandler.js";
import env from "../config/env.js";
import jwt from "jsonwebtoken";

export const verifyToken = asyncHandler(async (req, res, next) => {
  const token = req.headers.authorization.split(" ")[1];
  if (!token) return res.error(401, "Unauthorized", "No token provided.");

  const decoded = await jwt.verify(token, env.JWT_SECRET);

  const account = await accountModel.findById(decoded.account_id);
  if (!account) {
    return res.error(401, "Unauthorized", "Account not found");
  }
  if (account.status === "BLOCKED") {
    return res.error(403, "Forbidden", "Account blocked");
  }

  req.account = decoded;
  next();
});
