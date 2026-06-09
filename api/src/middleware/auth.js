import { asyncHandler } from "../utils/asyncHandler.js";
import env from "../config/env.js";
import jwt from "jsonwebtoken";
import { accountModel } from "../auth/model.js";

export const verifyToken = asyncHandler(async (req, res, next) => {
  if (!req.headers.authorization)
    return res.error(401, "Unauthorized", "No token provided.");

  const token = req.headers.authorization.split(" ")[1];
  if (!token) return res.error(401, "Unauthorized", "Invalid token.");

  const decoded = await jwt.verify(token, env.JWT_SECRET);

  const account = await accountModel.findById(decoded.account_id);
  if (!account) {
    return res.error(401, "Unauthorized", "Account not found");
  }
  if (decoded.version !== account.tokenVersion) {
    return res.error(401, "Unauthorized", "Token expired");
  }

  if (account.status === "BLOCKED") {
    return res.error(403, "Forbidden", "Account blocked");
  }

  req.account = decoded;
  next();
});

export const verifyRoles = (...allowedRoles) =>
  asyncHandler(async (req, res, next) => {
    const account = req.account;
    if (!account) {
      return res.error(401, "Unauthorized", "Authentication required.");
    }

    if (!allowedRoles.includes(account.role)) {
      return res.error(
        403,
        "Forbidden",
        "You do not have permission to access this resource.",
      );
    }
    next();
  });
