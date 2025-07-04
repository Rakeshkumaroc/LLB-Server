// routes/courseEnquiryFollowUp.routes.js

const express = require("express");
const router = express.Router();
const {
  createCourseEnquiryFollowUp,
  getFollowUpsByEnquiryId,
} = require("../controllers/followUpController");

const { tokenChecker, allowRoles } = require("../middleware/authChecker");

// Create follow-up
router.post(
  "/create-follow-up",
  tokenChecker,
  allowRoles(["childAdmin"]),
  createCourseEnquiryFollowUp
);

// Get follow-ups by enquiryId
router.get(
  "/get-followups/:enquiryId",
  tokenChecker,
  allowRoles(["admin", "childAdmin"]),
  getFollowUpsByEnquiryId
);

module.exports = router;
