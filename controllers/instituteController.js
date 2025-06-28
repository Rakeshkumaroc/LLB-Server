const Institute = require("../models/institute.model");
const InstituteUserMapping = require("../models/instituteUserMapping.model");

const createInstitute = async (req, res, next) => {
  try {
    const {
      instituteName,
      contactPerson,
      email,
      phone,
      address,
    } = req.body;

    if (!instituteName || !contactPerson || !email || !phone) {
      return res.status(400).json({ message: "All required fields must be provided." });
    }

    // Step 1: Create Institute
    const newInstitute = await Institute.create({
      instituteName,
      contactPerson,
      email,
      phone,
      address,
    });

    // Step 2: Create User Mapping (Owner role)
    const newMapping = await InstituteUserMapping.create({
      userId: req.user._id.toString(),             // From JWT middleware
      instituteId: newInstitute._id.toString(),
    
    });

    // Final response
    return res.status(201).json({
      message: "Institute and mapping created successfully",
      institute: newInstitute,
      mapping: newMapping,
    });

  } catch (error) {
    console.error("Error creating institute:", error);
    return res.status(500).json({ message: "Server error", error });
  }
};

// ----------------- GET ALL FOR CURRENT USER -----------------
const getAllInstitutesForUser = async (req, res, next) => {
  try {
    const userId = req.user._id.toString();

    const mappings = await InstituteUserMapping.find({
      userId,
      isDeleted: false,
      isActive: true,
    });

    const instituteIds = mappings.map(m => m.instituteId);

    const institutes = await Institute.find({
      _id: { $in: instituteIds },
      isDeleted: false,
    });

    return res.status(200).json({ institutes });
  } catch (error) {
    next(error);
  }
};

// ----------------- GET SINGLE BY ID -----------------
const getSingleInstituteById = async (req, res, next) => {
  try {
    const instituteId = req.params.id;

    const institute = await Institute.findOne({
      _id: instituteId,
      isDeleted: false,
    });

    if (!institute) {
      return res.status(404).json({ message: "Institute not found" });
    }

    return res.status(200).json({ institute });
  } catch (error) {
    next(error);
  }
};

// ----------------- UPDATE -----------------
const updateInstituteById = async (req, res, next) => {
  try {
    const instituteId = req.params.id;
    const updateData = req.body;

    const updatedInstitute = await Institute.findOneAndUpdate(
      { _id: instituteId, isDeleted: false },
      updateData,
      { new: true }
    );

    if (!updatedInstitute) {
      return res.status(404).json({ message: "Institute not found or deleted" });
    }

    return res.status(200).json({
      message: "Institute updated successfully",
      institute: updatedInstitute,
    });
  } catch (error) {
    next(error);
  }
};

// ----------------- DELETE (Soft Delete) -----------------
const deleteInstituteById = async (req, res, next) => {
  try {
    const instituteId = req.params.id;

    const deletedInstitute = await Institute.findOneAndUpdate(
      { _id: instituteId, isDeleted: false },
      { isDeleted: true, isActive: false },
      { new: true }
    );

    // Also soft delete mappings
    await InstituteUserMapping.updateMany(
      { instituteId, isDeleted: false },
      { isDeleted: true, isActive: false }
    );

    if (!deletedInstitute) {
      return res.status(404).json({ message: "Institute not found or already deleted" });
    }

    return res.status(200).json({ message: "Institute deleted successfully" });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createInstitute,
  getAllInstitutesForUser,
  getSingleInstituteById,
  updateInstituteById,
  deleteInstituteById,
};