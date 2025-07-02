const mongoose = require("mongoose");

const generalEnquirySchema = new mongoose.Schema(
  {
    email: { type: String, required: true, trim: true },
    courseId: { type: mongoose.Schema.Types.ObjectId, required: true },

    status: {
      type: String,
      enum: ["pending", "in-progress", "resolved", "closed"],
      default: "pending",
    },

    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("generalEnquiry", generalEnquirySchema);
