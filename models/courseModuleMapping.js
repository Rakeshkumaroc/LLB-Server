const mongoose = require("mongoose");

const courseModuleMappingSchema = new mongoose.Schema(
  {
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
  
    },
    moduleId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
   
    },
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

module.exports = mongoose.model("courseModuleMapping", courseModuleMappingSchema);
