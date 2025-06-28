// ======================== CONTROLLERS/course.controller.js ========================
const Course = require("../models/courseModel");
const ApiResponse = require("../utils/ApiResponse");
const ApiError = require("../utils/ApiError");

// Create course
const createCourse = async (req, res, next) => {
  try {
    const { courseName, description, courseThumbnail } = req.body;
    if (!courseName || !description || !courseThumbnail)
      return next(
        new ApiError("Course name thumbnail description is required", 400)
      );

    const existing = await Course.findOne({ courseName });
    if (existing) return next(new ApiError("Course already exists", 400));

    const course = await Course.create({
      courseName,
      description,
      courseThumbnail,
    });
    res
      .status(201)
      .json(new ApiResponse(201, "Course created successfully", course));
  } catch (error) {
    next(error);
  }
};

// Get all active courses
const getAllCourses = async (req, res, next) => {
  try {
    const courses = await Course.find({ isDeleted: false });
    res.status(200).json(new ApiResponse(200, "Course list", courses));
  } catch (error) {
    next(error);
  }
};

// Get single course by ID
const getSingleCourseById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const course = await Course.findOne({ _id: id, isDeleted: false });
    if (!course) return next(new ApiError("Course not found", 404));

    res.status(200).json(new ApiResponse(200, "Course details", course));
  } catch (error) {
    next(error);
  }
};

// Update course
const updateCourse = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { courseName, description, isActive } = req.body;

    const course = await Course.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { courseName, description, isActive },
      { new: true }
    );

    if (!course) return next(new ApiError("Course not found", 404));

    res.status(200).json(new ApiResponse(200, "Course updated", course));
  } catch (error) {
    next(error);
  }
};

// Soft delete course
const deleteCourse = async (req, res, next) => {
  try {
    const { id } = req.params;
    const course = await Course.findByIdAndUpdate(
      id,
      { isDeleted: true, isActive: false },
      { new: true }
    );
    if (!course) return next(new ApiError("Course not found", 404));

    res.status(200).json(new ApiResponse(200, "Course deleted", course));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createCourse,
  getAllCourses,
  getSingleCourseById,
  updateCourse,
  deleteCourse,
};
