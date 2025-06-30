const CourseModule = require("../models/courseModule");
const CourseModuleMapping = require("../models/courseModuleMapping");
const ApiResponse = require("../utils/ApiResponse");
const ApiError = require("../utils/ApiError");

// ==================== CREATE MODULE + MAP ====================
const createCourseModule = async (req, res, next) => {
  try {
    const { title, subtitle, content, order, courseId } = req.body;

    if (!title || !courseId) {
      return next(new ApiError("title and courseId are required", 400));
    }

    const module = await CourseModule.create({
      title,
      subtitle,
      content,
      order,
    });

    const mapping = await CourseModuleMapping.create({
      courseId,
      moduleId: module._id,
    });

    res.status(201).json(
      new ApiResponse(201, "Module created and mapped successfully", {
        module,
        mapping,
      })
    );
  } catch (error) {
    next(error);
  }
};

// ==================== GET MODULES BY COURSE ====================
const getModulesByCourseId = async (req, res, next) => {
  try {
    const { courseId } = req.params;

    // Step 1: Get all mapping entries
    const mappings = await CourseModuleMapping.find({
      courseId,
      isDeleted: false,
      isActive: true,
    });

    if (!mappings.length) {
      return next(new ApiError("No modules found for this course", 404));
    }

    // Step 2: Extract all moduleIds
    const moduleIds = mappings.map((m) => m.moduleId);

    // Step 3: Fetch modules using those IDs
    const modules = await CourseModule.find({
      _id: { $in: moduleIds },
      isDeleted: false,
      isActive: true,
    }).sort({ order: 1 }); // optional: sort by order

    res.status(200).json(new ApiResponse(200, "Modules for course", modules));
  } catch (error) {
    next(error);
  }
};

// ==================== GET SINGLE MODULE ====================
const getSingleModule = async (req, res, next) => {
  try {
    const { id } = req.params;
    const module = await CourseModule.findOne({ _id: id, isDeleted: false });

    if (!module) return next(new ApiError("Module not found", 404));

    res.status(200).json(new ApiResponse(200, "Module found", module));
  } catch (error) {
    next(error);
  }
};

// ==================== UPDATE MODULE ====================
const updateCourseModule = async (req, res, next) => {
  try {
    const { id } = req.params;
    console.log(id)
    const updates = req.body;
 console.log(updates)
    const updated = await CourseModule.findOneAndUpdate(
      { _id: id, isDeleted: false },
      updates,
      { new: true }
    );

    if (!updated) return next(new ApiError("Module not found", 404));

    res.status(200).json(new ApiResponse(200, "Module updated", updated));
  } catch (error) {
    next(error);
  }
};

// ==================== DELETE MODULE (SOFT DELETE) ====================
const deleteCourseModule = async (req, res, next) => {
  try {
    const { id } = req.params;

    const module = await CourseModule.findByIdAndUpdate(
      id,
      { isDeleted: true, isActive: false },
      { new: true }
    );

    if (!module) return next(new ApiError("Module not found", 404));

    await CourseModuleMapping.updateMany(
      { moduleId: id },
      {
        isDeleted: true,
        isActive: false,
        validTo: new Date(),
      }
    );

    res.status(200).json(new ApiResponse(200, "Module and mapping soft deleted", module));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createCourseModule,
  getModulesByCourseId,
  getSingleModule,
  updateCourseModule,
  deleteCourseModule,
};
