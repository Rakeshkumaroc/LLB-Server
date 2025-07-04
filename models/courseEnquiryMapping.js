const mongoose = require("mongoose");

const courseEnquiryMappingSchema = new mongoose.Schema(
  {
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    enquiryId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    validFrom: { type: Date, default: Date.now },
    validTo: { type: Date, default: null },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model(
  "CourseEnquiryMapping",
  courseEnquiryMappingSchema
);
