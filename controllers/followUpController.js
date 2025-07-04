// controllers/courseEnquiryFollowUp.controller.js

const CourseEnquiryFollowUp = require("../models/followUp");
const CourseEnquiryFollowUpMapping = require("../models/followUpMapping");
const CourseEnquiry = require("../models/courseEnquiry");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");

const createCourseEnquiryFollowUp = async (req, res, next) => {
  try {
    const { enquiryId, mode, message, nextFollowUpDate, nextFollowUpTime } = req.body;
    const childAdminId = req.user?.userId;

    // 🔸 Validation
    if (!enquiryId || !mode || !message || !nextFollowUpDate || !nextFollowUpTime) {
      return next(new ApiError("All fields are required", 400));
    }

    const validModes = ["call", "onlineMeeting", "physicalMeeting"];
    if (!validModes.includes(mode)) {
      return next(new ApiError("Invalid mode value", 400));
    }

    // 🔍 Check if enquiry exists
    const enquiry = await CourseEnquiry.findOne({ _id: enquiryId, isDeleted: false });
    if (!enquiry) {
      return next(new ApiError("Enquiry not found", 404));
    }

    // 🔹 Create FollowUp
    const followUp = await CourseEnquiryFollowUp.create({
      mode,
      message,
      nextFollowUpDate,
      nextFollowUpTime,
    });

    // 🔹 Create mapping
    const mapping = await CourseEnquiryFollowUpMapping.create({
      followUpId: followUp._id,
      enquiryId,
      childAdminId,
    });

    return res.status(201).json(
      new ApiResponse(201, "Follow-up created successfully", {
        followUp,
         mapping,
      })
    );
  } catch (error) {
    next(error);
  }
};

const getFollowUpsByEnquiryId = async (req, res, next) => {
  try {
    const { enquiryId } = req.params;

    if (!enquiryId) {
      return next(new ApiError("Enquiry ID is required", 400));
    }

    // 🔹 Find all mappings for this enquiry
    const mappings = await CourseEnquiryFollowUpMapping.find({
      enquiryId,
      isDeleted: false,
    });

    if (!mappings.length) {
      return next(new ApiError("No follow-up records found", 404));
    }

    const followUpIds = mappings.map((m) => m.followUpId);

    const followUps = await CourseEnquiryFollowUp.find({
      _id: { $in: followUpIds },
      isDeleted: false,
    })
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json(
      new ApiResponse(200, "Follow-up logs fetched successfully", followUps)
    );
  } catch (error) {
    next(error);
  }
};



module.exports = { createCourseEnquiryFollowUp,getFollowUpsByEnquiryId };
