import { asyncHandler } from "../utils/asyncHandler.js";
import { purchaseModel } from "./model.js";
import { courseService } from "../course/service.js";
import { deleteCache, getCache, setCache } from "../config/redis.js";

class PurchaseController {
  purchaseCourse = asyncHandler(async (req, res) => {
    const { course_id } = req.body;
    const { account_id } = req.account;

    const purchaseExists = await purchaseModel.findOne({
      account_id,
      course_id,
    });
    if (purchaseExists)
      return res.error(
        400,
        "Already Exists",
        "Purchase already exists. You can't purchase again.",
      );

    const course = await courseService.getCourseDetails(course_id);
    if (!course)
      return res.error(
        404,
        "Not Found",
        "Course does not exists with this course_id.",
      );

    // calculate GST
    const base_price = course.overview.offer_price;
    const gst_percentage = 18;
    const gst_amount = (base_price * gst_percentage) / 100;
    const total_price = Number(base_price + gst_amount).toFixed();

    const purchase = await purchaseModel.create({
      base_price,
      gst_percentage,
      gst_amount,
      total_price,
      account_id,
      course_id,
      status: "COMPLETED",
    });
    // Invalidate user-specific caches
    await deleteCache(`purchases:user:${account_id}`);
    await deleteCache(`purchase:check:${account_id}:${course_id}`);
    await deleteCache("admin:dashboard:stats");
    res.success(201, purchase, "Purchase compeleted successfully.");
  });

  getCurrenUserPurchases = asyncHandler(async (req, res) => {
    const { account_id } = req.account;
    const purchases = await purchaseModel.find({ account_id });
    res.success(200, purchases, "Purchases fetched successfully.");
  });

  checkPurchase = asyncHandler(async (req, res) => {
    const { account_id } = req.account;
    const { course_id } = req.body;

    const cacheKey = `purchase:check:${account_id}:${course_id}`;
    const cached = await getCache(cacheKey);
    if (cached !== null) return res.success(200, cached, "Purchase checked successfully.");

    const purchase = await purchaseModel.findOne({ account_id, course_id });
    const result = { isPurchased: !!purchase };
    await setCache(cacheKey, result, 60 * 30); // 30 min
    res.success(200, result, "Purchase checked successfully.");
  });

  getPurchaseDetails = asyncHandler(async (req, res) => {
    const { purchase_id } = req.body;
    const purchase = await purchaseModel.findOne({ account_id, course_id });
    if (!purchase) return res.error(404, "Not Found", "Purchase not found.");
    res.success(200, purchase, "Purchase checked successfully.");
  });

  getCurrenUserPurchasedCourses = asyncHandler(async (req, res) => {
    const { account_id } = req.account;
    const cacheKey = `purchases:user:${account_id}`;

    const cached = await getCache(cacheKey);
    if (cached) return res.success(200, cached, "Purchases fetched successfully.");

    const purchases = await purchaseModel.find({ account_id }).populate({
      path: "course_id",
      populate: {
        path: "thumbnail",
        select: "url",
      },
    });
    const courses = purchases.map((p) => p.course_id);
    await setCache(cacheKey, courses, 60 * 15); // 15 min
    res.success(200, courses, "Purchases fetched successfully.");
  });

  getAllPurchases = asyncHandler(async (req, res) => {
    const purchases = await purchaseModel.find().sort({ createdAt: -1 });
    res.success(200, purchases, "Purchases fetched successfully.");
  });
}

export const purchaseController = new PurchaseController();
