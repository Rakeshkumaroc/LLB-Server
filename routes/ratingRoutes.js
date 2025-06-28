// ======================== ROUTES/rating.routes.js ========================
const express = require("express");
const router = express.Router();
const ratingController = require("../controllers/rating.controller");
const { verifyToken } = require("../middlewares/auth.middleware");

// Create a new rating
router.post("/", verifyToken, ratingController.createRating);

// Get all ratings for a specific course
router.get("/course/:courseId", ratingController.getRatingsByCourse);

// Update a rating by rating ID
router.put("/:id", verifyToken, ratingController.updateRating);

// Soft delete a rating by rating ID
router.delete("/:id", verifyToken, ratingController.deleteRating);

module.exports = router