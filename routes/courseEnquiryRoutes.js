const express = require("express");
const router = express.Router();

const {
  createCourseEnquiry,
  getAllCourseEnquiries,
  updateCourseEnquiryStatus,
  deleteCourseEnquiry,
  getCourseEnquiryByUserId,
  getEnquiriesByCourseId,
  getSingleCourseEnquiry
} = require("../controllers/courseEnquiryController");

const { tokenChecker, allowRoles } = require("../middleware/authChecker");

// =============== USER ROUTES ===============

// 🔹 User creates course enquiry
router.post("/create-course-enquiry", tokenChecker, createCourseEnquiry);

// 🔹 Logged-in user gets their total course enquiries
router.get("/get-course-enquiry-by-user-id", tokenChecker, getCourseEnquiryByUserId);

// =============== ADMIN ROUTES ===============
const adminOnly = ["admin"];

// 🔹 Admin fetches all course enquiries (with course name)
router.get(
  "/get-all-course-enquiries",
  tokenChecker,
  allowRoles(adminOnly),
  getAllCourseEnquiries
);

router.get(
  "/get-single-course-enquiry/:id",
  tokenChecker,
  getSingleCourseEnquiry
);

// 🔹 Admin updates enquiry status
router.put(
  "/update-status-enquiry/:id",
  tokenChecker,
  updateCourseEnquiryStatus
);

//  Admin deletes enquiry (soft delete + mapping)
router.delete(
  "/delete-enquiry/:id",
  tokenChecker,
  deleteCourseEnquiry
);


//  Admin gets enquiry count for a course
router.get(
  "/get-enquiries-by-course-id/:courseId",
  tokenChecker,
  allowRoles(adminOnly),
 getEnquiriesByCourseId
);

module.exports = router;
