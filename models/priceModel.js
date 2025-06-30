const mongoose = require("mongoose");

const priceSchema = new mongoose.Schema(
  {
    price: { type:Number, required: true },              
    isActive: { type: Boolean, default: true },           
    isDelete: { type: Boolean, default: false },           
  },
  { timestamps: true }
);

module.exports = mongoose.model("priceCollection", priceSchema);
