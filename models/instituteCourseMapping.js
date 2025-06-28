const mongoose = require("mongoose");
const instituteCourseMappingSchema = new mongoose.Schema(
  {
    instituteId: { type: mongoose.Schema.Types.ObjectId, required: true },
    courseId: { type: mongoose.Schema.Types.ObjectId, required: true },
    agreedPrice: { type: Number, required: true },
    totalSeats: { type: Number, required: true },
    usedSeats: { type: Number, default: 0 },
    validFrom: {
    type: Date,
    default: Date.now,
  },
  validTo: {
    type: Date,
    default: null,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  isDeleted: {
    type: Boolean,
    default: false,
  }
  },
  { timestamps: true }
);

module.exports = mongoose.model("instituteCourseMapping", instituteCourseMappingSchema);