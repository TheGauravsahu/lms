import express from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { accountModel } from "../auth/model.js";
import { courseModel } from "../course/models/course.js";
import { purchaseModel } from "../purchase/model.js";
import { verifyToken, verifyRoles } from "../middleware/auth.js";

const r = express.Router();
r.use(verifyToken);
r.use(verifyRoles("ADMIN"));

// GET /api/admin/stats — dashboard stats + monthly chart data
r.get(
  "/stats",
  asyncHandler(async (req, res) => {
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

    res.success(
      200,
      {
        stats: {
          totalStudents,
          totalCourses,
          totalPurchases: purchases.length,
          totalRevenue,
        },
        monthlyChart: Object.values(monthlyData),
        recentPurchases,
      },
      "Dashboard stats fetched successfully.",
    );
  }),
);

export default r;
