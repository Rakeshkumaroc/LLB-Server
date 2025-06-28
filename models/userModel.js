// ======================== MODELS/user.model.js ========================
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    userName: { type: String, trim: true, required: true },
    email: { type: String, trim: true, required: true },
    phone: { type: String, trim: true, default:null },
    password: { type: String, trim: true, required: true, select: false },
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
    role: { type: String, enum: ["student", "corporate", "admin", "childAdmin", "institute"] },
    userProfilePic: { type: String, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model("userCollection", userSchema);