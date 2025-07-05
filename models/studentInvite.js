const mongoose = require("mongoose");

const studentInviteSchema = new mongoose.Schema(
  {
    email: { type: String, required: true },
    token: { type: String, required: true },
    isUsed: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("StudentInvite", studentInviteSchema);
