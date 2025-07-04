const express = require("express");
const router = express.Router();

const {
  assignCourseEnquiry,
  getAssignedEnquiriesForChildAdmin,
} = require("../controllers/enquiryAssignController");

const { tokenChecker, allowRoles } = require("../middleware/authChecker");

const adminRoles = ["admin"];
const childAdminRoles = ["childAdmin"];

// 🔹 Admin assigns enquiry to child admin
router.post(
  "/assign-course-enquiry",
  tokenChecker,
  allowRoles(adminRoles),
  assignCourseEnquiry
);

// 🔹 Child Admin fetches assigned enquiries
router.get(
  "/get-assigned-enquiries-for-child-admin",
  tokenChecker,
  allowRoles(childAdminRoles),
  getAssignedEnquiriesForChildAdmin
);

module.exports = router;
