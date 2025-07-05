const mongoose = require("mongoose");

const instituteStudentMappingSchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId,  required: true },
    instituteId: { type: mongoose.Schema.Types.ObjectId,  required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("instituteStudentMapping", instituteStudentMappingSchema);
