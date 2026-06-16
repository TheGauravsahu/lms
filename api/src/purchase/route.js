import express from "express";
import { purchaseController } from "./controller.js";
import { verifyRoles, verifyToken } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { purchaseCourseSchema } from "../schemas/purchase.js";

const r = express.Router();
r.use(verifyToken);

r.post(
  "/purchase-course",
  validate(purchaseCourseSchema),
  purchaseController.purchaseCourse,
);
r.get(
  "/my-purchases",
  validate(purchaseCourseSchema),
  purchaseController.getCurrenUserPurchases,
);
r.get(
  "/my-purchased-courses",
  validate(purchaseCourseSchema),
  purchaseController.getCurrenUserPurchasedCourses,
);
r.post(
  "/check-purchase",
  validate(purchaseCourseSchema),
  purchaseController.checkPurchase,
);
r.post(
  "/:purchase_id",
  validate(purchaseCourseSchema),
  purchaseController.getPurchaseDetails,
);
// admin-only
r.post(
  "/all-purchases",
  verifyRoles("ADMIN"),
  validate(purchaseCourseSchema),
  purchaseController.getAllPurchases,
);

export default r;
