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
router.post("/create-course-enquiry", tokenChecker, createCourseEnquiry);

// 🔹 Logged-in user gets their total course enquiries
router.get("/get-user-course-enquiry-stats", tokenChecker, getUserCourseEnquiryStats);

// =============== ADMIN ROUTES ===============
const adminOnly = ["admin"];

// 🔹 Admin fetches all course enquiries (with course name)
router.get(
  "/get-all-course-enquiries",
  tokenChecker,
  allowRoles(adminOnly),
  getAllCourseEnquiries
);

// 🔹 Admin updates enquiry status
router.put(
  "/update-status-enquiry/:id",
  tokenChecker,
  allowRoles(adminOnly),
  updateCourseEnquiryStatus
);

// 🔹 Admin deletes enquiry (soft delete + mapping)
router.delete(
  "/delete-enquiry/:id",
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
