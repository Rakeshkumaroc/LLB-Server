const Mentor = require("../models/mentorModel");
const mentorUserMMapping = require("../models/mentorUserMapping");
const ApiResponse = require("../utils/ApiResponse");
const ApiError = require("../utils/ApiError");

// ✅ CREATE Mentor + mapping with validation
const createMentor = async (req, res, next) => {
  try {
    const { mentorName, title, description, mentorPic } = req.body;

    const userId = req.user?.userId;
    const createdByName =
      req.user?.role === "admin" ? "admin" : req.user?.userName;

    //  Field validation
    if (!mentorName || !title) {
      return next(new ApiError("mentorName and title are required", 400));
    }

    if (!userId || !createdByName) {
      return next(
        new ApiError("Unauthorized or missing user information", 401)
      );
    }

    // 🔹 Create mentor
    const mentor = await Mentor.create({
      mentorName,
      title,
      description,
      mentorPic,
      createdByName,
    });

    // 🔹 Create new mapping
    const mapping = await mentorUserMMapping.create({
      userId,
      mentorId: mentor._id,
    });

    res.status(201).json(
      new ApiResponse(201, "Mentor created and mapped successfully", {
        mentor,
        mapping,
      })
    );
  } catch (err) {
    next(err);
  }
};

// ✅ UPDATE Mentor
const updateMentor = async (req, res, next) => {
  try {
    const { mentorId } = req.params;
    const { mentorName, title, description, mentorPic } = req.body;

    const updatedByName =
      req.user.role === "admin" ? "admin" : req.user.userName;

    const updated = await Mentor.findOneAndUpdate(
      { _id: mentorId, isDeleted: false },
      {
        mentorName,
        title,
        description,
        mentorPic,
        updatedByName,
      },
      { new: true }
    );

    if (!updated) return next(new ApiError("Mentor not found", 404));

    res.status(200).json(new ApiResponse(200, "Mentor updated", updated));
  } catch (err) {
    next(err);
  }
};


// ✅ GET all mentors (excluding soft deleted)
const getAllMentors = async (req, res, next) => {
  try {
    const mentors = await Mentor.find({ isDeleted: false }).sort({ createdAt: -1 });
    res
      .status(200)
      .json(new ApiResponse(200, "Mentors fetched successfully", mentors));
  } catch (err) {
    next(err);
  }
};

// ✅ GET single mentor by ID
const getMentorById = async (req, res, next) => {
  try {
    const { mentorId } = req.params;

    const mentor = await Mentor.findOne({
      _id: mentorId,
      isDeleted: false,
    });

    if (!mentor) {
      return next(new ApiError("Mentor not found", 404));
    }

    res
      .status(200)
      .json(new ApiResponse(200, "Mentor fetched successfully", mentor));
  } catch (err) {
    next(err);
  }
};






// ✅ DELETE Mentor + Mapping
const deleteMentor = async (req, res, next) => {
  try {
    const { mentorId } = req.params;
    const deletedByName =
      req.user.role === "admin" ? "admin" : req.user.userName;

    // 🔹 Soft delete mentor
    const deletedMentor = await Mentor.findOneAndUpdate(
      { _id: mentorId, isDeleted: false },
      {
        isDeleted: true,
        isActive: false,
        deletedByName,
      },
      { new: true }
    );

    if (!deletedMentor) {
      return next(new ApiError("Mentor not found", 404));
    }

    // 🔹 Soft delete mappings
    await UserMentorMapping.updateMany(
      { mentorId, isDeleted: false },
      {
        isDeleted: true,
        isActive: false,
        validTo: new Date(),
      }
    );

    res
      .status(200)
      .json(new ApiResponse(200, "Mentor and mappings deleted", deletedMentor));
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createMentor,
  updateMentor,
  deleteMentor,
   getAllMentors,
  getMentorById,
};
