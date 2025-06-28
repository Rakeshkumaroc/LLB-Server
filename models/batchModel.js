// ======================== MODELS/batch.model.js ========================

const mongoose = require("mongoose");
const batchSchema = new mongoose.Schema(
  {
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: "courseCollection", required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    mode: { type: String, enum: ["Online", "Offline", "Hybrid"], required: true },
    location: { type: String, required: true },
    capacity: { type: Number, required: true },
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("batchCollection", batchSchema);