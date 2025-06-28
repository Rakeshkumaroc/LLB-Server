// ======================== MODELS/institute.model.js ========================
const mongoose = require("mongoose");
const instituteSchema = new mongoose.Schema(
  {
    instituteName: { type: String, required: true },
    contactPerson: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String },
    isVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("instituteCollection", instituteSchema);