// models/courseEnquiryFollowUp.model.js

const mongoose = require("mongoose");

const courseEnquiryFollowUpSchema = new mongoose.Schema(
  {
    mode: {
      type: String,
      enum: ["call", "onlineMeeting", "physicalMeeting"],
      required: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    nextFollowUpDate: {
      type: Date,
      required: true,
    },
    nextFollowUpTime: {
      type: String,
      required: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("CourseEnquiryFollowUp", courseEnquiryFollowUpSchema);
