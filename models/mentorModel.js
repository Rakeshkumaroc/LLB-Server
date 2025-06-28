const mongoose = require("mongoose");

const mentorSchema = new mongoose.Schema(
  {
    mentorName: { type: String, trim: true, required: true },
    title: { type: String, trim: true, required: true },
    description: { type: String, trim: true, default: null },
    mentorPic: { type: String, default: null },

    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },

    createdByName: { type: String, default: null },
    updatedByName: { type: String, default: null },
    deletedByName: { type: String, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model("mentorCollection", mentorSchema);
