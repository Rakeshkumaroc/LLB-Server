// ======================== ROUTES/course.routes.js ========================
const express = require("express");
const router = express.Router();
const {
  createCourse,
  getAllCourses,
  getSingleCourseById,
  updateCourse,
  deleteCourse,
} = require("../controllers/courseController");

const { tokenChecker, allowRoles } = require("../middleware/authChecker");

// CREATE
router.post(
  "/create-course",
  tokenChecker,
  allowRoles(["admin"]),
  createCourse
);

// GET ALL
router.get("/get-all-courses", getAllCourses);

// GET SINGLE BY ID
router.get("/get-single-course-by-id/:id", getSingleCourseById);

// UPDATE
router.put(
  "/update-course/:id",
  tokenChecker,
  allowRoles(["admin"]),
  updateCourse
);

// DELETE (soft)
router.delete(
  "/delete-course/:id",
  tokenChecker,
  allowRoles(["admin"]),
  deleteCourse
);

module.exports = router;
