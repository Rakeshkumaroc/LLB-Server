const express = require("express");
const router = express.Router();
const {
  createGeneralEnquiry,
  getAllGeneralEnquiries,
  updateGeneralEnquiryStatus,
  deleteGeneralEnquiry,
} = require("../controllers/genEnquiryController");

const { tokenChecker, allowRoles } = require("../middleware/authChecker");

// Public
router.post("/create-general-enquiry", createGeneralEnquiry);

// Admin / Child Admin Only
router.get(
  "/get-all-general-enquiries",
  tokenChecker,
  allowRoles(["admin", "childAdmin"]),
  getAllGeneralEnquiries
);

router.put(
  "/update-status/:id",
  tokenChecker,
  allowRoles(["admin", "childAdmin"]),
  updateGeneralEnquiryStatus
);

router.delete(
  "/delete/:id",
  tokenChecker,
  allowRoles(["admin", "childAdmin"]),
  deleteGeneralEnquiry
);

module.exports = router;
