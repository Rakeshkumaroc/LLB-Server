

const mongoose = require("mongoose");

const courseEnquiryAssignMappingSchema = new mongoose.Schema(
  {
    enquiryId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    childAdminId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    assignId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model(
  "CourseEnquiryAssignMapping",
  courseEnquiryAssignMappingSchema
);
