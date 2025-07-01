// ======================== CONTROLLERS/rating.controller.js ========================
const Rating = require("../models/ratingModel");
const RatingMapping = require("../models/ratingUserMapping");
const ApiResponse = require("../utils/ApiResponse");
const ApiError = require("../utils/ApiError");
const userModel = require("../models/userModel");
const courseModel = require("../models/courseModel");

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




const getAllRatings = async (req, res, next) => {
  try {
    const mappings = await RatingMapping.find({ isDeleted: false });

    if (!mappings.length) {
      return next(new ApiError("No reviews found", 404));
    }

    const ratingIds = mappings.map((m) => m.ratingId);
    const userIds = mappings.map((m) => m.userId);
    const courseIds = mappings.map((m) => m.courseId);

    const [ratings, users, courses] = await Promise.all([
      Rating.find({
        _id: { $in: ratingIds },
        isDeleted: false,
        isActive: true,
        review: { $ne: "" },
      }),
      userModel.find({ _id: { $in: userIds } }),
      courseModel.find({ _id: { $in: courseIds } }),
    ]);

    const validRatingIds = new Set(ratings.map((r) => r._id.toString()));

    const ratingMap = {};
    ratings.forEach((r) => (ratingMap[r._id.toString()] = r));

    const userMap = {};
    users.forEach((u) => (userMap[u._id.toString()] = u));

    const courseMap = {};
    courses.forEach((c) => (courseMap[c._id.toString()] = c));

    const enriched = mappings
      .filter((m) => validRatingIds.has(m.ratingId.toString()))
      .map((m) => {
        const rating = ratingMap[m.ratingId.toString()];
        const user = userMap[m.userId.toString()];
        const course = courseMap[m.courseId.toString()];
        return {
          userName: user?.userName || "Unknown",
          userProfile: user?.profile || null,
          courseId: m.courseId,
          courseName: course?.courseName || "Unknown",
          rating: rating.rating,
          review: rating.review,
          showInUI: rating.showInUI,
          showInTestimonial: rating.showInTestimonial,
          createdAt: rating.createdAt,
        };
      })
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.status(200).json(new ApiResponse(200, "All reviews", enriched));
  } catch (error) {
    next(error);
  }
};



// Get all ratings for a course this is for ui
const getRatingsByCourse = async (req, res, next) => {
  try {
    const { courseId } = req.params;

    const mappings = await RatingMapping.find({
      courseId,
      isDeleted: false,
    });

    if (!mappings.length) {
      return next(new ApiError("No ratings found for this course", 404));
    }

    const ratingIds = mappings.map((m) => m.ratingId);
    const userIds = mappings.map((m) => m.userId);

    // ✅ Only fetch ratings that are active, not deleted, and marked for UI display
    const ratings = await Rating.find({
      _id: { $in: ratingIds },
      isDeleted: false,
      isActive: true,
      showInUI: true,
    });

    const users = await userModel.find({ _id: { $in: userIds } });

    const ratingMap = {};
    ratings.forEach((r) => {
      ratingMap[r._id.toString()] = r;
    });

    const userMap = {};
    users.forEach((u) => {
      userMap[u._id.toString()] = u;
    });

    // Merge data: only keep mappings where the rating passed the filter above
    const enriched = mappings
      .filter((m) => ratingMap[m.ratingId.toString()])
      .map((m) => {
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



const getRatingsByCourseForAdmin = async (req, res, next) => {
  try {
    const { courseId } = req.params;

    const mappings = await RatingMapping.find({
      courseId,
      isDeleted: false,
    });

    if (!mappings.length) {
      return next(new ApiError("No ratings found for this course", 404));
    }

    const ratingIds = mappings.map((m) => m.ratingId);
    const userIds = mappings.map((m) => m.userId);

    // ✅ Only fetch ratings that are active, not deleted, and marked for UI display
    const ratings = await Rating.find({
      _id: { $in: ratingIds },
      isDeleted: false,
      isActive: true,
    });

    const users = await userModel.find({ _id: { $in: userIds } });

    const ratingMap = {};
    ratings.forEach((r) => {
      ratingMap[r._id.toString()] = r;
    });

    const userMap = {};
    users.forEach((u) => {
      userMap[u._id.toString()] = u;
    });

    // Merge data: only keep mappings where the rating passed the filter above
    const enriched = mappings
      .filter((m) => ratingMap[m.ratingId.toString()])
      .map((m) => {
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





const getTestimonialRatings = async (req, res, next) => {
  try {
    const mappings = await RatingMapping.find({ isDeleted: false });

    if (!mappings.length) {
      return next(new ApiError("No ratings found", 404));
    }

    const ratingIds = mappings.map((m) => m.ratingId);
    const userIds = mappings.map((m) => m.userId);

    const ratings = await Rating.find({
      _id: { $in: ratingIds },
      isDeleted: false,
      isActive: true,
      showInTestimonial: true,
    });

    const validRatingIds = new Set(ratings.map((r) => r._id.toString()));
    const users = await userModel.find({ _id: { $in: userIds } });

    const ratingMap = {};
    ratings.forEach((r) => (ratingMap[r._id.toString()] = r));

    const userMap = {};
    users.forEach((u) => (userMap[u._id.toString()] = u));

    const enriched = mappings
      .filter((m) => validRatingIds.has(m.ratingId.toString()))
      .map((m) => {
        const rating = ratingMap[m.ratingId.toString()];
        const user = userMap[m.userId.toString()];
        return {
          userName: user?.userName || "Anonymous",
          userProfile: user?.profile || null,
          rating: rating?.rating || null,
          review: rating?.review || "",
          createdAt: rating?.createdAt || null,
        };
      });

    res.status(200).json(new ApiResponse(200, "Testimonial ratings fetched", enriched));
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


const bulkEnableShowInUi = async (req, res, next) => {
  try {
    const { ratingIds } = req.body;

    if (!Array.isArray(ratingIds) || ratingIds.length === 0) {
      return next(new ApiError("ratingIds must be a non-empty array", 400));
    }

    const result = await Rating.updateMany(
      { _id: { $in: ratingIds }, isDeleted: false },
      { $set: { showInUI: true, isActive: true } }
    );

    res.status(200).json(
      new ApiResponse(200, "Ratings marked as showInUI", result)
    );
  } catch (error) {
    next(error);
  }
};


const bulkEnableShowInTestimonial = async (req, res, next) => {
  try {
    const { ratingIds } = req.body;

    if (!Array.isArray(ratingIds) || ratingIds.length === 0) {
      return next(new ApiError("ratingIds must be a non-empty array", 400));
    }

    const result = await Rating.updateMany(
      { _id: { $in: ratingIds }, isDeleted: false },
      { $set: { showInTestimonial: true, isActive: true } }
    );

    res.status(200).json(
      new ApiResponse(200, "Ratings marked as showInTestimonial", result)
    );
  } catch (error) {
    next(error);
  }
};




const bulkDisableShowInUi = async (req, res, next) => {
  try {
    const { ratingIds } = req.body;

    if (!Array.isArray(ratingIds) || ratingIds.length === 0) {
      return next(new ApiError("ratingIds must be a non-empty array", 400));
    }

    const result = await Rating.updateMany(
      { _id: { $in: ratingIds }, isDeleted: false },
      { $set: { showInUI: false } }
    );

    res.status(200).json(
      new ApiResponse(200, "Ratings marked as showInUI", result)
    );
  } catch (error) {
    next(error);
  }
};


const bulkDisableShowInTestimonial = async (req, res, next) => {
  try {
    const { ratingIds } = req.body;

    if (!Array.isArray(ratingIds) || ratingIds.length === 0) {
      return next(new ApiError("ratingIds must be a non-empty array", 400));
    }

    const result = await Rating.updateMany(
      { _id: { $in: ratingIds }, isDeleted: false },
      { $set: { showInTestimonial: false} }
    );

    res.status(200).json(
      new ApiResponse(200, "Ratings marked as showInTestimonial", result)
    );
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

module.exports = { createRating, getRatingsByCourse, updateRating, deleteRating ,getAllRatings,getRatingsByCourseForAdmin ,bulkEnableShowInTestimonial ,bulkEnableShowInUi ,bulkDisableShowInTestimonial,bulkDisableShowInUi, getTestimonialRatings};
