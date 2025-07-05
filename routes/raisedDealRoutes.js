const express = require("express");
const router = express.Router();

const {
  createRaisedDeal,
  updateRaisedDeal,
  deleteRaisedDeal,
  getAllDeals,
  getSingleDealById,
  getDealsForUser,
  getSingleDealForUser,
  getCoursesWithDealsForInstitute
} = require("../controllers/raisedDealController");

const { tokenChecker, allowRoles } = require("../middleware/authChecker");

const adminRoles = ["admin"];

// ======================= ADMIN ROUTES =======================

// Create new raised deal
router.post(
  "/create-raised-deal",
  tokenChecker,
  allowRoles(adminRoles),
  createRaisedDeal
);

// Update raised deal by ID
router.put(
  "/update-raised-deal/:id",
  tokenChecker,
  allowRoles(adminRoles),
  updateRaisedDeal
);

// Delete raised deal by ID
router.delete(
  "/delete-raised-deal/:id",
  tokenChecker,
  allowRoles(adminRoles),
  deleteRaisedDeal
);

// Get all raised deals (admin)
router.get(
  "/get-all-raised-deals",
  tokenChecker,
  allowRoles(adminRoles),
  getAllDeals
);


router.get(
  "/get-courses-with-deals-for-institute",
  tokenChecker,
  getCoursesWithDealsForInstitute
);

// Get single raised deal (admin)
router.get(
  "/get-raised-deal/:id",
  tokenChecker,
  allowRoles(adminRoles),
  getSingleDealById
);

// ======================= INSTITUTE ROUTES (No role check, just token) =======================

// Get all deals for logged-in user
router.get("/get-deals-for-user", tokenChecker, getDealsForUser);

// Get single deal for logged-in user
router.get("/get-single-deal-for-user/:id", tokenChecker, getSingleDealForUser);

module.exports = router;
