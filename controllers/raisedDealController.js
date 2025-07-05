// Existing imports...
const RaisedDeal = require("../models/raisedDealModel");
const DealMapping = require("../models/raisedDealMapping");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const userModel = require("../models/userModel");
const courseModel = require("../models/courseModel");

// ✅ Admin: Create Deal
const createRaisedDeal = async (req, res, next) => {
  try {
    const { agreementPrice, seats, adminMessage, courseId, userId } = req.body;

    if (!agreementPrice || !seats || !adminMessage || !courseId || !userId) {
      return next(
        new ApiError("Missing required fields: price, seats, courseId, userId", 400)
      );
    }

    const raisedDeal = await RaisedDeal.create({
      agreementPrice,
      seats,
      adminMessage,
    });

    const mapping = await DealMapping.create({
      courseId,
      userId,
      raisedDealId: raisedDeal._id,
    });

    return res.status(201).json(
      new ApiResponse(201, "Deal created successfully", {
        raisedDeal,
        mapping,
      })
    );
  } catch (err) {
    next(err);
  }
};

// ✅ Admin: Update Deal
const updateRaisedDeal = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { agreementPrice, seats, adminMessage } = req.body;

    const updated = await RaisedDeal.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { agreementPrice, seats, adminMessage },
      { new: true }
    );

    if (!updated) return next(new ApiError("Deal not found", 404));

    res.status(200).json(
      new ApiResponse(200, "Deal updated successfully", updated)
    );
  } catch (err) {
    next(err);
  }
};

// ✅ Admin: Delete Deal
const deleteRaisedDeal = async (req, res, next) => {
  try {
    const { id } = req.params;

    const deal = await RaisedDeal.findOne({ _id: id, isDeleted: false });
    if (!deal) return next(new ApiError("Deal not found", 404));

    deal.isDeleted = true;
    await deal.save();

    await DealMapping.updateMany(
      { raisedDealId: id },
      { $set: { isDeleted: true, isActive: false, validTo: new Date() } }
    );

    res.status(200).json(
      new ApiResponse(200, "Deal and mapping deleted successfully")
    );
  } catch (err) {
    next(err);
  }
};

// ✅ Admin: Get All Deals (with userName)
const getAllDeals = async (req, res, next) => {
  try {
    const mappings = await DealMapping.find({ isDeleted: false });

    const allDeals = [];

    for (const map of mappings) {
      const deal = await RaisedDeal.findOne({
        _id: map.raisedDealId,
        isDeleted: false,
      });

      const user = await userModel.findOne({
        _id: map.userId,
        isDeleted: false,
      });

      if (deal) {
        allDeals.push({
          ...deal.toObject(),
          userName: user?.userName || "Unknown",
        });
      }
    }

    res.status(200).json(new ApiResponse(200, "All deals with user", allDeals));
  } catch (err) {
    next(err);
  }
};

// ✅ Institute: Get My Deals
const getDealsForUser = async (req, res, next) => {
  try {
    const userId = req.user?.userId;

    const mappings = await DealMapping.find({
      userId,
      isDeleted: false,
    });

    const userDeals = [];

    for (const map of mappings) {
      const deal = await RaisedDeal.findOne({
        _id: map.raisedDealId,
        isDeleted: false,
      });

      if (deal) {
        userDeals.push(deal);
      }
    }

    res.status(200).json(
      new ApiResponse(200, "Your raised deals fetched", userDeals)
    );
  } catch (err) {
    next(err);
  }
};

// ✅ Institute: Get Single Deal
const getSingleDealForUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;

    const mapping = await DealMapping.findOne({
      raisedDealId: id,
      userId,
      isDeleted: false,
    });

    if (!mapping) return next(new ApiError("No access to this deal", 403));

    const deal = await RaisedDeal.findOne({
      _id: id,
      isDeleted: false,
    });

    if (!deal) return next(new ApiError("Deal not found", 404));

    res.status(200).json(
      new ApiResponse(200, "Deal fetched successfully", deal)
    );
  } catch (err) {
    next(err);
  }
};


const getSingleDealById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const mapping = await DealMapping.findOne({
      raisedDealId: id,
      isDeleted: false,
    });
    if (!mapping) return next(new ApiError("Mapping not found", 404));

    const deal = await RaisedDeal.findOne({
      _id: id,
      isDeleted: false,
    });
    if (!deal) return next(new ApiError("Deal not found", 404));

    const user = await userModel.findOne({
      _id: mapping.userId,
      isDeleted: false,
    });

    const course = await courseModel.findOne({
      _id: mapping.courseId,
      isDeleted: false,
    });

    res.status(200).json(
      new ApiResponse(200, "Deal with mapped user and course fetched", {
        ...deal.toObject(),
        user: user || null,
        course: course || null,
      })
    );
  } catch (err) {
    next(err);
  }
};



const getCoursesWithDealsForInstitute = async (req, res, next) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return next(new ApiError("Unauthorized", 401));
    }

    // 🔹 Get all deal mappings for this institute user
    const mappings = await RaisedDealMapping.find({
      userId,
      isDeleted: false,
    }).select("courseId");

    const courseIds = mappings.map((m) => m.courseId);

    // 🔹 Get unique courses
    const uniqueCourseIds = [...new Set(courseIds.map(id => id.toString()))];

    const courses = await courseModel.find({
      _id: { $in: uniqueCourseIds },
      isDeleted: false,
    });

    res
      .status(200)
      .json(new ApiResponse(200, "Courses with raised deals", courses));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createRaisedDeal,
  updateRaisedDeal,
  deleteRaisedDeal,
  getAllDeals,
  getSingleDealById,
  getDealsForUser,
  getSingleDealForUser,
  getCoursesWithDealsForInstitute
};
