const RaisedDeal = require("../models/raisedDealModel");
const DealMapping = require("../models/raisedDealMapping");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const userModel = require("../models/userModel");

const createRaisedDeal = async (req, res, next) => {
  try {
    const { requestedPrice, requestedSeats, note, courseId } = req.body;

    const userId = req.user?.userId;

    if (!userId) {
      return next(new ApiError("Unauthorized", 401));
    }

    // ✅ Validate required fields
    if (!requestedPrice || !requestedSeats || !note || !courseId) {
      return next(
        new ApiError("Missing required fields: price, seats, courseId", 400)
      );
    }

    // 🔹 Create Raised Deal
    const raisedDeal = await RaisedDeal.create({
      requestedPrice,
      requestedSeats,
      note,
    });

    // 🔹 Create Mapping
    const mapping = await DealMapping.create({
      courseId,
      userId,
      raisedDealId: raisedDeal._id,
    });

    //  Response
    return res.status(201).json(
      new ApiResponse(201, "Raised deal created and mapped successfully", {
        raisedDeal,
        mapping,
      })
    );
  } catch (err) {
    next(err);
  }
};

// 🔹 1. Get All Deals
const getAllDeals = async (req, res, next) => {
  try {
    const mappings = await DealMapping.find({ isDeleted: false });

    const allDeals = [];

    for (const map of mappings) {
      const deal = await RaisedDeal.findOne({
        _id: map.raisedDealId,
        isDeleted: false,
      });
      const user = await userModel.findOne({ _id: map.userId, isDeleted: false });

      if (deal) {
        allDeals.push({
          ...deal.toObject(),
          userName: user?.userName || "Unknown",
        });
      }
    }

    res
      .status(200)
      .json(new ApiResponse(200, "All deals with userName", allDeals));
  } catch (error) {
    next(error);
  }
};

// 🔹 2. Get Single Deal by ID
const getSingleDealById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const mapping = await DealMapping.findOne({
      raisedDealId: id,
      isDeleted: false,
    });

    if (!mapping) return next(new ApiError("Mapping not found", 404));

    const deal = await RaisedDeal.findOne({ _id: id, isDeleted: false });
    const user = await userModel.findOne({ _id: mapping.userId, isDeleted: false });

    if (!deal || !user)
      return next(new ApiError("Deal or user not found", 404));

    res.status(200).json(
      new ApiResponse(200, "Deal fetched with user", {
        ...deal.toObject(),
        user,
      })
    );
  } catch (error) {
    next(error);
  }
};

const updateDealStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, adminMessage, negotiatedPrice } = req.body;

    //  Validate status
    if (!["pending", "approved", "rejected"].includes(status)) {
      return next(new ApiError("Invalid status", 400));
    }

    const updateData = { status }; // always include status

    // 💬 Add admin message if provided
    if (adminMessage !== undefined) {
      updateData.adminMessage = adminMessage;
    }

    //  Only allow negotiatedPrice update when approved
    if (status === "approved") {
      if (negotiatedPrice === undefined || isNaN(negotiatedPrice)) {
        return next(
          new ApiError(
            "Negotiated price is required and must be a number when approving",
            400
          )
        );
      }
      updateData.negotiatedPrice = negotiatedPrice;
    }

    //  If status is rejected and negotiatedPrice is sent, block it
    if (status === "rejected" && negotiatedPrice !== undefined) {
      return next(
        new ApiError(
          "Negotiated price is not allowed when rejecting a deal",
          400
        )
      );
    }

    const updatedDeal = await RaisedDeal.findOneAndUpdate(
      { _id: id, isDeleted: false },
      updateData,
      { new: true }
    );

    if (!updatedDeal) return next(new ApiError("Deal not found", 404));

    res
      .status(200)
      .json(new ApiResponse(200, `Deal ${status} successfully`, updatedDeal));
  } catch (error) {
    next(error);
  }
};


// 🔹 Delete Raised Deal (soft delete both deal + mapping)
const deleteRaisedDeal = async (req, res, next) => {
  try {
    const { id } = req.params;

    // 1. Find deal
    const deal = await RaisedDeal.findOne({ _id: id, isDeleted: false });
    if (!deal) return next(new ApiError("Deal not found", 404));

    // 2. Soft delete deal
    deal.isDeleted = true;
    await deal.save();

    // 3. Soft delete mapping(s)
    await DealMapping.updateMany(
      { raisedDealId: id },
      { $set: { isDeleted: true } }
    );

    res
      .status(200)
      .json(new ApiResponse(200, "Deal and mapping soft-deleted successfully"));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createRaisedDeal,
  getAllDeals,
  updateDealStatus,
  getSingleDealById,
};
