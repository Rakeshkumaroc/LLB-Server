const mongoose = require("mongoose");

const specialPriceSchema = new mongoose.Schema(
  {
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    
    },
    specialPriceId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
     
    },
    validFrom: {
      type: Date,
      default: Date.now
    },
    validTo: {
      type: Date,
      default: null
    },
    isActive: {
      type: Boolean,
      default: true
    },
    isDeleted: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("specialPriceMapping", specialPriceSchema);
