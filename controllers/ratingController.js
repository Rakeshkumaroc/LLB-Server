// ======================== CONTROLLERS/rating.controller.js ========================
const Rating = require("../models/rating.model");
const RatingMapping = require("../models/ratingMapping.model");
const ApiResponse = require("../utils/ApiResponse");
const ApiError = require("../utils/ApiError");

// Create Rating + Mapping
const createRating = async (req, res, next) => {
  try {
    const { courseId, rating, review } = req.body;
    const userId = req.user?.userId;

    if (!courseId || !rating || !userId) {
      return next(new ApiError("courseId, rating, and userId are required", 400));
    }

    const newRating = await Rating.create({ rating, review });

    const mapping = await RatingMapping.create({
      courseId,
      userId,
      ratingId: newRating._id,
    });

    res.status(201).json(
      new ApiResponse(201, "Rating submitted successfully", { newRating, mapping })
    );
  } catch (error) {
    next(error);
  }
};

// Get all ratings for a course
const getRatingsByCourse = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const mappings = await RatingMapping.find({ courseId, isDeleted: false })
      .populate("ratingId")
      .populate("userId", "userName");

    if (!mappings.length) {
      return next(new ApiError("No ratings found for this course", 404));
    }

    res.status(200).json(new ApiResponse(200, "Ratings list", mappings));
  } catch (error) {
    next(error);
  }
};

// Update rating
const updateRating = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rating, review } = req.body;

    const updated = await Rating.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { rating, review },
      { new: true }
    );

    if (!updated) return next(new ApiError("Rating not found", 404));

    res.status(200).json(new ApiResponse(200, "Rating updated", updated));
  } catch (error) {
    next(error);
  }
};

// Delete Rating + Mapping (soft delete)
const deleteRating = async (req, res, next) => {
  try {
    const { id } = req.params;

    const rating = await Rating.findByIdAndUpdate(id, { isDeleted: true }, { new: true });
    if (!rating) return next(new ApiError("Rating not found", 404));

    await RatingMapping.updateMany({ ratingId: id }, { isDeleted: true });

    res.status(200).json(new ApiResponse(200, "Rating and mapping soft-deleted", rating));
  } catch (error) {
    next(error);
  }
};

module.exports = { createRating, getRatingsByCourse, updateRating, deleteRating };
