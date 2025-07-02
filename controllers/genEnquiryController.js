const courseModel = require("../models/courseModel");
const GeneralEnquiry = require("../models/genEnquire");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");

// 🔹 Create General Enquiry (Public)
const createGeneralEnquiry = async (req, res, next) => {
  try {
    const { email, courseId } = req.body;

    // 🔍 Validate fields
    if (!email || !courseId) {
      return next(new ApiError("Email and courseId are required", 400));
    }

    // ✅ Email format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    if (!emailRegex.test(email)) {
      return next(new ApiError("Invalid email format", 400));
    }

    // 🔹 Create enquiry
    const enquiry = await GeneralEnquiry.create({
      email,
      courseId,
    });

    res
      .status(201)
      .json(new ApiResponse(201, "General enquiry submitted", enquiry));
  } catch (error) {
    next(error);
  }
};


// 🔹 Get All General Enquiries with Course Details
const getAllGeneralEnquiries = async (req, res, next) => {
  try {
    const enquiries = await GeneralEnquiry.find({ isDeleted: false }).lean();

    // Add courseName and course info manually
    const enriched = await Promise.all(
      enquiries.map(async (enquiry) => {
        const course = await courseModel.findById(enquiry.courseId)
          .select("courseName description duration")
          .lean();

        return {
          ...enquiry,
          courseDetails: course || null,
        };
      })
    );

    res
      .status(200)
      .json(new ApiResponse(200, "General enquiries fetched", enriched));
  } catch (error) {
    next(error);
  }
};


const updateGeneralEnquiryStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ["pending", "in-progress", "resolved", "closed"];
    if (!validStatuses.includes(status)) {
      return next(new ApiError("Invalid status value", 400));
    }

    const updated = await GeneralEnquiry.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { status },
      { new: true }
    );

    if (!updated) return next(new ApiError("General enquiry not found", 404));

    res
      .status(200)
      .json(new ApiResponse(200, "Status updated successfully", updated));
  } catch (error) {
    next(error);
  }
};


const deleteGeneralEnquiry = async (req, res, next) => {
  try {
    const { id } = req.params;

    const deleted = await GeneralEnquiry.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { isDeleted: true },
      { new: true }
    );

    if (!deleted) return next(new ApiError("General enquiry not found", 404));

    res
      .status(200)
      .json(new ApiResponse(200, "General enquiry deleted", deleted));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createGeneralEnquiry,
  getAllGeneralEnquiries,
  updateGeneralEnquiryStatus,
  deleteGeneralEnquiry,
};

