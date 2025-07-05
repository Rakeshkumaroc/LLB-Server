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

      const subject = `🔔 Follow-up Reminder: ${enquiry.name || "Unknown"} (${enquiry.phone || "No Phone"})`;

      const html = `
        <div style="font-family: 'Segoe UI', sans-serif; border: 1px solid #ccc; padding: 20px; border-radius: 8px; max-width: 600px; margin: auto;">
          <h2 style="color: #2c3e50;">📋 Your Follow-Up List for Today</h2>
          <p>Hello <strong>${childAdmin.userName || "Team"}</strong>,</p>
          <p>This is a reminder to follow up with the following enquiry today:</p>

          <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
            <tr>
              <td style="padding: 8px; font-weight: bold;">👤 Name:</td>
              <td style="padding: 8px;">${enquiry.name || "N/A"}</td>
            </tr>
            <tr style="background-color: #f9f9f9;">
              <td style="padding: 8px; font-weight: bold;">📧 Email:</td>
              <td style="padding: 8px;">${enquiry.email || "N/A"}</td>
            </tr>
            <tr>
              <td style="padding: 8px; font-weight: bold;">📞 Phone:</td>
              <td style="padding: 8px;">${enquiry.phone || "N/A"}</td>
            </tr>
            <tr style="background-color: #f9f9f9;">
              <td style="padding: 8px; font-weight: bold;">📌 Mode:</td>
              <td style="padding: 8px;">${followUp.mode || "N/A"}</td>
            </tr>
            <tr>
              <td style="padding: 8px; font-weight: bold;">🗓️ Time:</td>
              <td style="padding: 8px;">${followUp.nextFollowUpTime || "N/A"}</td>
            </tr>
            <tr style="background-color: #f9f9f9;">
              <td style="padding: 8px; font-weight: bold;">📝 Message:</td>
              <td style="padding: 8px;">${followUp.message || "N/A"}</td>
            </tr>
          </table>

          <p style="margin-top: 20px; color: #555;">Please make sure to connect with this user as per the scheduled time.</p>

          <hr style="margin: 30px 0;" />

          <p style="font-size: 13px; color: gray;">This is an automated reminder from the Law Learning Bench System.</p>
        </div>
      `;

      await sendMail(childAdmin.email, subject, "", html);
    }

    console.log(`✅ ${todayFollowUps.length} reminder(s) sent.`);
  } catch (err) {
    console.error("❌ Error sending reminders:", err);
  }
};



module.exports = { createCourseEnquiryFollowUp,getFollowUpsByEnquiryId ,sendFollowUpReminders };
