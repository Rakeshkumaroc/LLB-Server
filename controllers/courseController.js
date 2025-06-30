// ======================== CONTROLLERS/course.controller.js ========================

const Course = require("../models//courseModel");
const CourseModule = require("../models/courseModule");
const CourseModuleMapping = require("../models/courseModuleMapping");
const Price = require("../models/priceModel");
const CoursePriceMapping = require("../models/coursePriceMapping");
const SpecialPrice = require("../models/specialPrice");
const SpecialPriceMapping = require("../models/specialPriceMapping");
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
      price,
      specialPrice,
      modules,
    } = req.body;

    if (
      !courseName ||
      !videoUrl ||
      !duration ||
      !language ||
      !description ||
      !price
    ) {
      return next(new ApiError("Required fields are missing", 400));
    }

    const existing = await Course.findOne({ courseName, isDeleted: false });
    if (existing) return next(new ApiError("Course already exists", 400));

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

    if (Array.isArray(modules) && modules.length) {
      for (const m of modules) {
        const module = await CourseModule.create(m);
        await CourseModuleMapping.create({
          courseId: course._id,
          moduleId: module._id,
        });
      }
    }

    const newPrice = await Price.create({ price });
    await CoursePriceMapping.create({
      courseId: course._id,
      priceId: newPrice._id,
    });

    if (specialPrice) {
      const sp = await SpecialPrice.create({ specialPrice });
      await SpecialPriceMapping.create({
        courseId: course._id,
        specialPriceId: sp._id,
      });
    }

    res
      .status(201)
      .json(new ApiResponse(201, "Course created successfully", course));
  } catch (error) {
    console.log(error)
    console.log(error.message)
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
    if (!course) return next(new ApiError("Course not found", 404));

    const moduleMappings = await CourseModuleMapping.find({
      courseId: id,
      isDeleted: false,
    });
    const modules = [];
    for (const map of moduleMappings) {
      const mod = await CourseModule.findById(map.moduleId);
      if (mod) modules.push(mod);
    }

    const priceMap = await CoursePriceMapping.findOne({
      courseId: id,
      isDeleted: false,
    });
    const price = priceMap ? await Price.findById(priceMap.priceId) : null;

    const specialMap = await SpecialPriceMapping.findOne({
      courseId: id,
      isDeleted: false,
    });
    const specialPrice = specialMap
      ? await SpecialPrice.findById(specialMap.specialPriceId)
      : null;

    res.status(200).json(
      new ApiResponse(200, "Course details", {
        ...course.toObject(),
        modules,
        price,
        specialPrice,
      })
    );
  } catch (error) {
    next(error);
  }
};

// ======================= UPDATE COURSE =========================
const updateCourse = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      courseName,
      description,
      videoUrl,
      duration,
      language,
      pdfUrl,
      isFree,
      category,
      price,
      specialPrice,
    } = req.body;

    const course = await Course.findOneAndUpdate(
      { _id: id, isDeleted: false },
      {
        courseName,
        description,
        videoUrl,
        duration,
        language,
        pdfUrl,
        isFree,
        category,
      },
      { new: true }
    );
    if (!course) return next(new ApiError("Course not found", 404));

    const priceMap = await CoursePriceMapping.findOne({
      courseId: id,
      isDeleted: false,
    });
    if (priceMap && price) {
      await Price.findByIdAndUpdate(priceMap.priceId, { price });
    }

    const specialMap = await SpecialPriceMapping.findOne({
      courseId: id,
      isDeleted: false,
    });
    if (specialMap && specialPrice) {
      await SpecialPrice.findByIdAndUpdate(specialMap.specialPriceId, {
        specialPrice,
      });
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
    if (!course) return next(new ApiError("Course not found", 404));

    await CourseModuleMapping.updateMany(
      { courseId: id },
      { isDeleted: true, isActive: false }
    );
    await CoursePriceMapping.updateMany(
      { courseId: id },
      { isDeleted: true, isActive: false }
    );
    await SpecialPriceMapping.updateMany(
      { courseId: id },
      { isDeleted: true, isActive: false }
    );

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
