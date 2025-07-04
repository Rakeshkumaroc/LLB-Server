const express = require("express");
const router = express.Router();

const {
  createCourseEnquiry,
  getAllCourseEnquiries,
  updateCourseEnquiryStatus,
  deleteCourseEnquiry,
  getUserCourseEnquiryStats,
  getEnquiryCountByCourseId,
} = require("../controllers/courseEnquiryController");

const { tokenChecker, allowRoles } = require("../middleware/authChecker");

// =============== USER ROUTES ===============

// 🔹 User creates course enquiry
router.post("/create", tokenChecker, createCourseEnquiry);

// 🔹 Logged-in user gets their total course enquiries
router.get("/my-enquiry-count", tokenChecker, getUserCourseEnquiryStats);

// =============== ADMIN ROUTES ===============
const adminOnly = ["admin"];

// 🔹 Admin fetches all course enquiries (with course name)
router.get(
  "/all",
  tokenChecker,
  allowRoles(adminOnly),
  getAllCourseEnquiries
);

// 🔹 Admin updates enquiry status
router.put(
  "/update-status/:id",
  tokenChecker,
  allowRoles(adminOnly),
  updateCourseEnquiryStatus
);

// 🔹 Admin deletes enquiry (soft delete + mapping)
router.delete(
  "/delete/:id",
  tokenChecker,
  allowRoles(adminOnly),
  deleteCourseEnquiry
);

// 🔹 Admin gets enquiry count for a course
router.get(
  "/course-enquiry-count/:courseId",
  tokenChecker,
  allowRoles(adminOnly),
  getEnquiryCountByCourseId
);

module.exports = router;
