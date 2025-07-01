// ======================== ROUTES/rating.routes.js ========================
const express = require("express");
const router = express.Router();
const { createRating, getRatingsByCourse, updateRating, deleteRating,getAllRatings } = require("../controllers/ratingController");
const { tokenChecker, allowRoles } = require("../middleware/authChecker");

// Create a new rating
router.post("/create-rating",tokenChecker, createRating);

// Get all ratings for a specific course
router.get("/get-ratings-by-course-id/:courseId", getRatingsByCourse);

// Update a rating by rating ID
router.put("/update-rating/:id", updateRating);

// Soft delete a rating by rating ID
router.delete("/delete-rating/:id", deleteRating);

router.get("/all-ratings", getAllRatings);

module.exports = router