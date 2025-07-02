const mongoose = require("mongoose");

const raisedDealSchema = new mongoose.Schema(
  {
    requestedPrice: { type: Number, required: true },           
    requestedSeats: { type: Number, required: true },         
    negotiatedPrice: { type: Number, default: null },           
    note: { type: String, trim: true, default: "" },            

    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    adminMessage: { type: String, trim: true, default: null}, 
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("raisedDeal", raisedDealSchema);
