const mongoose = require("mongoose");

const instituteUserMappingSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true }, // Manual user ID
    instituteId: { type: String, required: true }, // Manual institute ID

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
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model(
  "InstituteUserMapping",
  instituteUserMappingSchema
);
