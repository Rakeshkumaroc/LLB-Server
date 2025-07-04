const mongoose = require("mongoose");

const courseEnquiryAssignSchema = new mongoose.Schema(
  {
    adminNotes: {
      type: String,
      trim: true,
    },
    assignedBy: {
      type: String,
      default: "Admin",
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model(
  "CourseEnquiryAssign",
  courseEnquiryAssignSchema
);
