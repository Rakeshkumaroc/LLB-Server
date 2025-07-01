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
      !isFree
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
      modules // array of module objects
    } = req.body;

    // 1. Update course
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

    // 2. Update price
    const priceMap = await CoursePriceMapping.findOne({
      courseId: id,
      isDeleted: false,
    });
    if (priceMap && price) {
      await Price.findByIdAndUpdate(priceMap.priceId, { price });
    }

    // 3. Update special price
    const specialMap = await SpecialPriceMapping.findOne({
      courseId: id,
      isDeleted: false,
    });
    if (specialMap && specialPrice) {
      await SpecialPrice.findByIdAndUpdate(specialMap.specialPriceId, {
        specialPrice,
      });
    }

    // 4. Update modules
    if (Array.isArray(modules)) {
      for (const mod of modules) {
        const { _id, title, subtitle, content, order } = mod;

        if (_id) {
          // Existing module - update
          await CourseModule.findByIdAndUpdate(_id, {
            title,
            subtitle,
            content,
            order,
          });
        } else {
          // New module - create and map
          const newModule = await CourseModule.create({
            title,
            subtitle,
            content,
            order,
          });

          await CourseModuleMapping.create({
            courseId: id,
            moduleId: newModule._id,
          });
        }
      }
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

    // 1. Soft delete course
    const course = await Course.findByIdAndUpdate(
      id,
      { isDeleted: true, isActive: false },
      { new: true }
    );
    if (!course) return next(new ApiError("Course not found", 404));

    const currentDate = new Date();

    // 2. Soft delete CourseModuleMapping & actual CourseModules
    const moduleMappings = await CourseModuleMapping.find({ courseId: id, isDeleted: false });

    await CourseModuleMapping.updateMany(
      { courseId: id },
      { isDeleted: true, isActive: false, validTo: currentDate }
    );

    const moduleIds = moduleMappings.map((m) => m.moduleId);
    await CourseModule.updateMany(
      { _id: { $in: moduleIds } },
      { isDeleted: true, isActive: false }
    );

    // 3. Soft delete CoursePriceMapping & actual Price
    const priceMappings = await CoursePriceMapping.find({ courseId: id, isDeleted: false });
    await CoursePriceMapping.updateMany(
      { courseId: id },
      { isDeleted: true, isActive: false, validTo: currentDate }
    );

    const priceIds = priceMappings.map((m) => m.priceId);
    await Price.updateMany(
      { _id: { $in: priceIds } },
      { isDeleted: true, isActive: false }
    );

    // 4. Soft delete SpecialPriceMapping & actual SpecialPrice
    const specialMappings = await SpecialPriceMapping.find({ courseId: id, isDeleted: false });
    await SpecialPriceMapping.updateMany(
      { courseId: id },
      { isDeleted: true, isActive: false, validTo: currentDate }
    );

    const specialPriceIds = specialMappings.map((m) => m.specialPriceId);
    await SpecialPrice.updateMany(
      { _id: { $in: specialPriceIds } },
      { isDeleted: true, isActive: false }
    );

    //  Response
    res.status(200).json(new ApiResponse(200, "Course and related data soft-deleted", course));
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
