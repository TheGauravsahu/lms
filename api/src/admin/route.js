import express from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { accountModel } from "../auth/model.js";
import { courseModel } from "../course/models/course.js";
import { purchaseModel } from "../purchase/model.js";
import { verifyToken, verifyRoles } from "../middleware/auth.js";
import { deleteCache, getCache, setCache } from "../config/redis.js";

const r = express.Router();
r.use(verifyToken);
r.use(verifyRoles("ADMIN"));

const STATS_CACHE_KEY = "admin:dashboard:stats";
const STATS_TTL = 60 * 5; // 5 minutes — dashboard data refreshes frequently

// GET /api/admin/stats — dashboard stats + monthly chart data
r.get(
  "/stats",
  asyncHandler(async (req, res) => {
    const cached = await getCache(STATS_CACHE_KEY);
    if (cached)
      return res.success(200, cached, "Dashboard stats fetched successfully.");

    const [totalStudents, totalCourses, purchases] = await Promise.all([
      accountModel.countDocuments({ role: "USER" }),
      courseModel.countDocuments(),
      purchaseModel.find().sort({ createdAt: 1 }),
    ]);

    const totalRevenue = purchases.reduce(
      (sum, p) => sum + (p.total_price || 0),
      0,
    );

    // Group purchases by month (last 12 months)
    const monthlyData = {};
    const now = new Date();
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      monthlyData[key] = { month: key, sales: 0, revenue: 0 };
    }

    purchases.forEach((p) => {
      const d = new Date(p.createdAt);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      if (monthlyData[key]) {
        monthlyData[key].sales += 1;
        monthlyData[key].revenue += p.total_price || 0;
      }
    });

    // Recent 5 purchases with populated course and account info
    const recentPurchases = await purchaseModel
      .find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("course_id", "title")
      .populate("account_id", "name mobile_no");

    const payload = {
      stats: {
        totalStudents,
        totalCourses,
        totalPurchases: purchases.length,
        totalRevenue,
      },
      monthlyChart: Object.values(monthlyData),
      recentPurchases,
    };

    await setCache(STATS_CACHE_KEY, payload, STATS_TTL);
    res.success(200, payload, "Dashboard stats fetched successfully.");
  }),
);

export default r;
