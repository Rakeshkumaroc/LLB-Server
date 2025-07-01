
const mongoose = require("mongoose");
const ratingSchema = new mongoose.Schema(
  {
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: true,
    },
    review: {
      type: String,
      trim: true,
      default: "",
    },
    showInCourse: { type: Boolean, default: false },
    showInTestimonial: { type: Boolean, default: false },


     isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("rating", ratingSchema);