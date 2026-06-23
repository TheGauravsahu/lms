import express from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { accountModel } from "../auth/model.js";
import { verifyToken, verifyRoles } from "../middleware/auth.js";

const r = express.Router();
r.use(verifyToken);
r.use(verifyRoles("ADMIN"));

// GET /api/students — list all users with role USER
r.get(
  "/",
  asyncHandler(async (req, res) => {
    const students = await accountModel
      .find({ role: "USER" })
      .sort({ createdAt: -1 })
      .select("-tokenVersion");
    res.success(200, students, "Students fetched successfully.");
  }),
);

// POST /api/students — create a new student account
r.post(
  "/",
  asyncHandler(async (req, res) => {
    const { name, mobile_no, email } = req.body;
    if (!name || !mobile_no)
      return res.error(400, "Validation Error", "name and mobile_no are required.");

    const exists = await accountModel.findOne({ mobile_no });
    if (exists)
      return res.error(400, "Already Exists", "A student with this mobile number already exists.");

    const student = await accountModel.create({
      name,
      mobile_no,
      email: email || undefined,
      role: "USER",
      status: "ACTIVE",
    });
    res.success(201, student, "Student created successfully.");
  }),
);

// PUT /api/students/:id — edit a student
r.put(
  "/:id",
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { name, mobile_no, email, status } = req.body;

    const student = await accountModel.findById(id);
    if (!student || student.role !== "USER")
      return res.error(404, "Not Found", "Student not found.");

    const updated = await accountModel.findByIdAndUpdate(
      id,
      { name, mobile_no, email, status },
      { new: true, runValidators: true },
    );
    res.success(200, updated, "Student updated successfully.");
  }),
);

// DELETE /api/students/:id — delete a student
r.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const student = await accountModel.findById(id);
    if (!student || student.role !== "USER")
      return res.error(404, "Not Found", "Student not found.");

    await accountModel.findByIdAndDelete(id);
    res.success(200, null, "Student deleted successfully.");
  }),
);

export default r;
