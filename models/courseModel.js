// ======================== MODELS/course.model.js ========================

const mongoose = require("mongoose");
const courseSchema = new mongoose.Schema(
  {
    courseName: { type: String, required: true, trim: true },
    courseThumbnail: { type: String, required: true },
    description: { type: String, trim: true },
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("courseCollection", courseSchema);
