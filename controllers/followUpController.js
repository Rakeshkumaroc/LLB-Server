// controllers/courseEnquiryFollowUp.controller.js

const CourseEnquiryFollowUp = require("../models/followUp");
const CourseEnquiryFollowUpMapping = require("../models/followUpMapping");
const CourseEnquiry = require("../models/courseEnquiry");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const { sendMail } = require("../utils/sendMail");
const moment = require("moment");
const userModel = require("../models/userModel");
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

const sendFollowUpReminders = async () => {
  try {
    const todayStart = moment.utc().startOf("day").toDate();
    const todayEnd = moment.utc().endOf("day").toDate();

    const mappings = await CourseEnquiryFollowUpMapping.find({ isDeleted: false }).lean();

    const todayFollowUps = [];

    for (const m of mappings) {
      const followUp = await CourseEnquiryFollowUp.findOne({
        _id: m.followUpId,
        isDeleted: false,
        nextFollowUpDate: { $gte: todayStart, $lte: todayEnd },
      }).lean();

      if (!followUp) continue;

      const childAdmin = await userModel.findById(m.childAdminId).lean();
      const enquiry = await CourseEnquiry.findById(m.enquiryId).lean();

      if (!childAdmin?.email) continue;

      todayFollowUps.push({ followUp, childAdmin, enquiry });
    }



    console.log("✅ Total follow-ups found for today:", todayFollowUps.length);

    for (const f of todayFollowUps) {
      const { childAdmin, followUp, enquiry } = f;
      const subject = `🔔 Follow-up Reminder: ${enquiry?.name || "Unknown"}`;
      const html = `
        <h3>Reminder: Follow-Up Scheduled Today</h3>
        <p><strong>Mode:</strong> ${followUp.mode}</p>
        <p><strong>Message:</strong> ${followUp.message}</p>
        <p><strong>Time:</strong> ${followUp.nextFollowUpTime}</p>
      `;

      await sendMail(childAdmin.email, subject, "", html); // ✔️ Match original function signature
    }

    console.log(`✅ ${todayFollowUps.length} reminder(s) sent.`);
  } catch (err) {
    console.error("❌ Error sending reminders:", err);
  }
};


module.exports = { createCourseEnquiryFollowUp,getFollowUpsByEnquiryId ,sendFollowUpReminders };
