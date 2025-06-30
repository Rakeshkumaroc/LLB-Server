const Course = require("../models/courseModel");
const ApiResponse = require("../utils/ApiResponse");
const ApiError = require("../utils/ApiError");

// ======================= CREATE COURSE =========================
const createCourse = async (req, res, next) => {
  try {
    const {
      courseName,
      description,
      courseThumbnail,
      videoUrl,
      duration,
      language,
      createdBy,
      pdfUrl,
      isFree,
      category,
    } = req.body;

    //  Validation
    if (!courseName || !videoUrl || !duration || !language || !description) {
      return next(
        new ApiError(
          "courseName, videoUrl, duration, language, and description are required",
          400
        )
      );
    }

    // Check for duplicates
    const existing = await Course.findOne({ courseName, isDeleted: false });
    if (existing) {
      return next(new ApiError("Course already exists", 400));
    }

    const course = await Course.create({
      courseName,
      description,
      courseThumbnail,
      videoUrl,
      duration,
      language,
      createdBy: createdBy || "LLB",
      pdfUrl,
      isFree: isFree ?? false,
      category,
    });

    res
      .status(201)
      .json(new ApiResponse(201, "Course created successfully", course));
  } catch (error) {
    next(error);
  }
};

// ======================= GET ALL COURSES =========================
const getAllCourses = async (req, res, next) => {
  try {
    const courses = await Course.find({ isDeleted: false, isActive: true });
    res.status(200).json(new ApiResponse(200, "Course list", courses));
  } catch (error) {
    next(error);
  }
};

// ======================= GET SINGLE COURSE =========================
const getSingleCourseById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const course = await Course.findOne({ _id: id, isDeleted: false });
    if (!course) {
      return next(new ApiError("Course not found", 404));
    }

    res.status(200).json(new ApiResponse(200, "Course details", course));
  } catch (error) {
    next(error);
  }
};

// ======================= UPDATE COURSE =========================
const updateCourse = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const course = await Course.findOneAndUpdate(
      { _id: id, isDeleted: false },
      updates,
      { new: true }
    );

    if (!course) {
      return next(new ApiError("Course not found", 404));
    }

    res.status(200).json(new ApiResponse(200, "Course updated", course));
  } catch (error) {
    next(error);
  }
};

// ======================= DELETE COURSE (SOFT DELETE) =========================
const deleteCourse = async (req, res, next) => {
  try {
    const { id } = req.params;

    const course = await Course.findByIdAndUpdate(
      id,
      { isDeleted: true, isActive: false },
      { new: true }
    );

    if (!course) {
      return next(new ApiError("Course not found", 404));
    }

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
