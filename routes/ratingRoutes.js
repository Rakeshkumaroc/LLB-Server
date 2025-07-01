const express = require("express");
const router = express.Router();

const {
  createRating,
  getRatingsByCourse,
  getRatingsByCourseForAdmin,
  getAllRatings,
  getTestimonialRatings,
  updateRating,
  deleteRating,
  bulkEnableShowInUi,
  bulkDisableShowInUi,
  bulkEnableShowInTestimonial,
  bulkDisableShowInTestimonial,
} = require("../controllers/ratingController");

const { tokenChecker, allowRoles } = require("../middleware/authChecker");

// ====================== USER ROUTES ======================

// User creates a rating
router.post("/create-rating", tokenChecker, createRating);

// Get ratings visible on course UI
router.get("/get-ratings-by-course-id/:courseId", getRatingsByCourse);

// Get testimonial ratings to show on testimonial section
router.get("/get-testimonial-ratings", getTestimonialRatings);

// ====================== ADMIN ROUTES ======================

const adminRoles = ["admin"];

// Admin gets all ratings (with user & course join)
router.get(
  "/all-ratings",
  tokenChecker,
  allowRoles(adminRoles),
  getAllRatings
);

// Admin gets all ratings for a course (even hidden ones)
router.get(
  "/get-ratings-by-course-id-admin/:courseId",
  tokenChecker,
  allowRoles(adminRoles),
  getRatingsByCourseForAdmin
);

// Admin updates a rating
router.put(
  "/update-rating/:id",
  tokenChecker,
  allowRoles(adminRoles),
  updateRating
);

// Admin soft-deletes a rating
router.delete(
  "/delete-rating/:id",
  deleteRating
);

// Admin enables 'showInUI' for multiple ratings
router.put(
  "/enable-show-in-ui",
  tokenChecker,
  allowRoles(adminRoles),
  bulkEnableShowInUi
);

// Admin disables 'showInUI' for multiple ratings
router.put(
  "/disable-show-in-ui",
  tokenChecker,
  allowRoles(adminRoles),
  bulkDisableShowInUi
);

// Admin enables 'showInTestimonial' for multiple ratings
router.put(
  "/enable-show-in-testimonial",
  tokenChecker,
  allowRoles(adminRoles),
  bulkEnableShowInTestimonial
);

// Admin disables 'showInTestimonial' for multiple ratings
router.put(
  "/disable-show-in-testimonial",
  tokenChecker,
  allowRoles(adminRoles),
  bulkDisableShowInTestimonial
);

module.exports = router;
