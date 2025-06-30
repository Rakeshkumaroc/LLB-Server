const mongoose = require("mongoose");

const specialPriceSchema = new mongoose.Schema(
  {
    specialPrice: { type: Number, required: true },
    validFrom: {
      type: Date,
      default: Date.now,
    },
    validTo: {
      type: Date,
      default: null,
    },
    isActive: { type: Boolean, default: true },
    isDelete: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("specialPrice", specialPriceSchema);
