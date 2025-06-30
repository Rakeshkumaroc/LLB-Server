// ======================== CONTROLLERS/rating.controller.js ========================
const Rating = require("../models/ratingModel");
const RatingMapping = require("../models/ratingUserMapping");
const ApiResponse = require("../utils/ApiResponse");
const ApiError = require("../utils/ApiError");
const userModel = require("../models/userModel");

// Create Rating + Mapping
const createRating = async (req, res, next) => {
  try {
    const { courseId, rating, review } = req.body;
    const userId = req.user?.userId;
console.log(courseId, rating, review ,userId)
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

    // Step 1: Get all mappings for course
    const mappings = await RatingMapping.find({
      courseId,
      isDeleted: false,
    });

    if (!mappings.length) {
      return next(new ApiError("No ratings found for this course", 404));
    }

    // Step 2: Extract all ratingIds and userIds
    const ratingIds = mappings.map((m) => m.ratingId);
    const userIds = mappings.map((m) => m.userId);

    const [ratings, users] = await Promise.all([
      Rating.find({ _id: { $in: ratingIds } }),
      userModel.find({ _id: { $in: userIds } }),
    ]);

    const ratingMap = {};
    ratings.forEach((r) => {
      ratingMap[r._id.toString()] = r;
    });

    const userMap = {};
    users.forEach((u) => {
      userMap[u._id.toString()] = u;
    });

    // Step 3: Merge data
    const enriched = mappings.map((m) => {
      const rating = ratingMap[m.ratingId.toString()];
      const user = userMap[m.userId.toString()];

      return {
        userName: user?.userName || "Unknown",
        userProfile: user?.profile || null,
        rating: rating?.rating || null,
        review: rating?.review || "",
        createdAt: rating?.createdAt || null,
      };
    });

    res.status(200).json(new ApiResponse(200, "Ratings list", enriched));
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

    // Step 1: Soft delete the rating
    const rating = await Rating.findByIdAndUpdate(
      id,
      { isDeleted: true },
      { new: true }
    );

    if (!rating) return next(new ApiError("Rating not found", 404));

    // Step 2: Soft delete and update mapping
    await RatingMapping.updateMany(
      { ratingId: id },
      {
        isDeleted: true,
        isActive: false,
        validTo: new Date(),
      }
    );

    res.status(200).json(
      new ApiResponse(200, "Rating and mapping soft-deleted", rating)
    );
  } catch (error) {
    next(error);
  }
};

module.exports = { createRating, getRatingsByCourse, updateRating, deleteRating };
