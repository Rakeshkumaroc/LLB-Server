const mongoose = require("mongoose");

const raisedDealSchema = new mongoose.Schema(
  {
 
    requestedPrice: { type: Number, required: true },
    requestedSeats: { type: Number, required: true },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },

    adminRemarks: { type: String, default: "" },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("RaisedDeal", raisedDealSchema);
