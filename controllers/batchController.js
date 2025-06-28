// ======================== CONTROLLERS/batch.controller.js ========================
const Batch = require("../models/batchModel");
const Course = require("../models/courseModel");
const BatchCourseMapping = require("../models/batchCourseMapping");
const ApiResponse = require("../utils/ApiResponse");
const ApiError = require("../utils/ApiError");

// Create new batch and map to course
const createBatch = async (req, res, next) => {
  try {
    const {
      batchName,
      batchNo,
      courseId,
      startDate,
      endDate,
      startTime,
      endTime,
      mode,
      location,
      capacity,
    } = req.body;

    if (
      !courseId ||
      !startDate ||
      !endDate ||
      !startTime ||
      !endTime ||
      !mode ||
      !location ||
      !capacity ||
       !batchName||
      !batchNo

    ) {
      return next(new ApiError("All fields are required", 400));
    }

    const courseExists = await Course.findOne({
      _id: courseId,
      isDeleted: false,
    });
    if (!courseExists) {
      return next(new ApiError("Course not found", 404));
    }

    // Step 1: Create batch
    const batch = await Batch.create({
      courseId,
      startDate,
      endDate,
      startTime,
      endTime,
      mode,
      location,
      capacity,
       batchName,
      batchNo,
    });

    // Step 2: Insert into mapping table
    const mapping = await BatchCourseMapping.create({
      courseId,
      batchId: batch._id,
    });

    res.status(201).json(
      new ApiResponse(201, "Batch created and mapped successfully", {
        batch,
        mapping,
      })
    );
  } catch (error) {
    next(error);
  }
};

// Get all batches with course name
const getAllBatches = async (req, res, next) => {
  try {
    const batches = await Batch.find({ isDeleted: false, isActive: true });

    if (!batches || batches.length === 0) {
      return next(new ApiError("No active batches found", 404));
    }

    res.status(200).json(new ApiResponse(200, "Batch list", batches));
  } catch (error) {
    next(error);
  }
};

// Get single batch by ID
const getBatchById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const batch = await Batch.findOne({
      _id: id,
      isDeleted: false,
      isActive: true,
    });

    if (!batch) return next(new ApiError("Batch not found", 404));

    res.status(200).json(new ApiResponse(200, "Batch details", batch));
  } catch (error) {
    next(error);
  }
};

// Update batch
const updateBatch = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const batch = await Batch.findOneAndUpdate(
      { _id: id, isDeleted: false, isActive: true },
      updates,
      { new: true }
    );

    if (!batch) return next(new ApiError("Batch not found", 404));

    res.status(200).json(new ApiResponse(200, "Batch updated", batch));
  } catch (error) {
    next(error);
  }
};

// Soft delete batch
const deleteBatch = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Step 1: Soft delete from batchCollection
    const batch = await Batch.findByIdAndUpdate(
      id,
      { isDeleted: true, isActive: false },
      { new: true }
    );
    if (!batch) return next(new ApiError("Batch not found", 404));

    //  Step 2: Soft delete from courseBatchMapping
    await BatchCourseMapping.updateMany(
      { batchId: id },
      { isDeleted: true, isActive: false, validTo: new Date() }
    );

    res
      .status(200)
      .json(new ApiResponse(200, "Batch and mapping deleted", batch));
  } catch (error) {
    next(error);
  }
};

const getAllBatchesByCourseId = async (req, res, next) => {
  try {
    const { id } = req.params;

    // 🔎 Step 1: Get all mapping entries for courseId
    const mappings = await BatchCourseMapping.find({
      courseId:id,
    });

    if (!mappings.length) {
      return next(new ApiError("No batches found for this course", 404));
    }

    // 🎯 Step 2: Extract batchIds
    const batchIds = mappings.map((m) => m.batchId);

    // 📦 Step 3: Get batch data from batch model
    const batches = await Batch.find({
      _id: { $in: batchIds },
      isDeleted: false,
      isActive: true,
    });

    res
      .status(200)
      .json(new ApiResponse(200, "All batches for course", batches));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createBatch,
  getAllBatches,
  getBatchById,
  updateBatch,
  deleteBatch,
  getAllBatchesByCourseId
};
