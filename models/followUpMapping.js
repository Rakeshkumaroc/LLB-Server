// models/courseEnquiryFollowUpMapping.model.js

const mongoose = require("mongoose");

const followUpMappingSchema = new mongoose.Schema(
  {
    followUpId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    enquiryId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    childAdminId: {
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

module.exports = mongoose.model("followUpMapping", followUpMappingSchema);
