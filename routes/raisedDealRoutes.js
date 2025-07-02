const express = require("express");
const router = express.Router();

const {
  createRaisedDeal,
  getAllDeals,
  getSingleDealById,
  updateDealStatus,
} = require("../controllers/raisedDealController");

const { tokenChecker, allowRoles } = require("../middleware/authChecker");

const adminRoles = ["admin"];

//  USER ROUTES

// Institute (logged-in) raises a deal request

router.post("/create-raised-deal", tokenChecker, createRaisedDeal);

//  ADMIN ROUTES

router.get(
  "/all-raised-deals",
  tokenChecker,
  allowRoles(adminRoles),
  getAllDeals
);

//  Get a specific deal
router.get("/get-single-raised-deal/:id", tokenChecker, getSingleDealById);

// Admin Update status, message, negotiated price (combined)
router.put(
  "/update-raised-deal-status/:id",
  tokenChecker,
  allowRoles(adminRoles),
  updateDealStatus
);

module.exports = router;
