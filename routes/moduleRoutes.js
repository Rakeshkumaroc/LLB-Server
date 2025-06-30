const express = require("express");
const router = express.Router();
const {
  createCourseModule,
  getModulesByCourseId,
  getSingleModule,
  updateCourseModule,
  deleteCourseModule,
} = require("../controllers/moduleController");

//  Create module + mapping
router.post("/create-course-module", createCourseModule);

//  Get all modules by course ID
router.get("/get-modules-by-course-id/:courseId", getModulesByCourseId);

//  Get single module
router.get("/get-single-module/:id", getSingleModule);

//  Update module
router.put("/update-course-module/:id", updateCourseModule);

//  Delete module (soft delete)
router.delete("/delete-course-module/:id", deleteCourseModule);

module.exports = router;
