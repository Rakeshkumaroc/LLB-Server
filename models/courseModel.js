// ======================== MODELS/course.model.js ========================

const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema(
  {
    courseName: {
      type: String,
      required: true,
      trim: true,
    },
    courseThumbnail: {
      type: String,
      default: null, // Optional: can be null initially
    },
    description: {
      type: String,
      trim: true,
    },
    videoUrl: {
      type: String,
      required: true,
    },
    duration: {
      type: String,
      required: true,
    },
    language: {
      type: String,
      required: true,
    },
    createdBy: {
      type: String,
      default: "LLB", // Could be "admin" or dynamic user later
    },
    category: {
      type: String,
    },
    pdfUrl: {
      type: String,
      trim: true,
    },
     redirectLink: {
      type: String,
      trim: true,
      default: null,
    },
    isLlbCourse: {
      type: Boolean,
      default: false,
    },
    isFree: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
  }
);

module.exports = mongoose.model("courseCollection", courseSchema);