const mongoose = require("mongoose");

const raisedDealSchema = new mongoose.Schema(
  {
    agreementPrice: { type: Number, required: true },           
    seats: { type: Number, required: true },                             
    adminMessage: { type: String, trim: true, default: null}, 
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("raisedDeal", raisedDealSchema);