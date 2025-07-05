const express = require("express");
const router = express.Router();

const {
  assignCourseEnquiry,
  getAssignedEnquiriesForChildAdmin,
  getAssignedEnquiriesbyChildAdminId,
  getSingleAssignedEnquiryById,
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
router.get(
  "/get-assigned-enquiries-by-child-admin-id/:childAdminId",
  tokenChecker,
  allowRoles(adminRoles),
  getAssignedEnquiriesbyChildAdminId
);
 
router.get(
  "/get-single-assigned-enquiry/:enquiryId",
  tokenChecker,
  allowRoles(childAdminRoles),
  getSingleAssignedEnquiryById
);

module.exports = router;