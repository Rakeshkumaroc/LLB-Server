const CourseEnquiry = require("../models/courseEnquiry");
const CourseEnquiryMapping = require("../models/courseEnquiryMapping");
const Course = require("../models/courseModel"); // fixed import name
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");

// 🔹 Create Course Enquiry (Login Required)
const createCourseEnquiry = async (req, res, next) => {
  try {
    const { name, email, message, courseId } = req.body;
    const userId = req.user?.userId;

    if (!name || !email || !message || !courseId || !userId) {
      return next(new ApiError("All fields are required", 400));
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    if (!emailRegex.test(email)) {
      return next(new ApiError("Invalid email format", 400));
    }

    const enquiry = await CourseEnquiry.create({ name, email, message });

    const mapping = await CourseEnquiryMapping.create({
      userId,
      courseId,
      enquiryId: enquiry._id,
    });

    res.status(201).json(
      new ApiResponse(201, "Course enquiry submitted successfully", {
        enquiry,
        mapping,
      })
    );
  } catch (error) {
    next(error);
  }
};

// 🔹 Get All Enquiries with Course Name
const getAllCourseEnquiries = async (req, res, next) => {
  try {
    const mappings = await CourseEnquiryMapping.find({ isDeleted: false });

    if (!mappings.length) {
      return next(new ApiError("No course enquiries found", 404));
    }

    const enquiryIds = mappings.map((m) => m.enquiryId);
    const courseIds = mappings.map((m) => m.courseId);

    const [enquiries, courses] = await Promise.all([
      CourseEnquiry.find({ _id: { $in: enquiryIds }, isDeleted: false }),
      Course.find({ _id: { $in: courseIds } }).select("courseName"),
    ]);

    const courseMap = {};
    courses.forEach((course) => {
      courseMap[course._id.toString()] = course.courseName;
    });

    const enquiryMap = {};
    enquiries.forEach((enq) => {
      enquiryMap[enq._id.toString()] = enq;
    });

    const result = mappings
      .filter((m) => enquiryMap[m.enquiryId.toString()])
      .map((m) => {
        const enquiry = enquiryMap[m.enquiryId.toString()];
        const courseName = courseMap[m.courseId.toString()] || "Unknown";

        return {
          _id: enquiry._id,
          name: enquiry.name,
          email: enquiry.email,
          message: enquiry.message,
          status: enquiry.status,
          createdAt: enquiry.createdAt,
          courseName,
        };
      });

    res.status(200).json(
      new ApiResponse(200, "All course enquiries with course name", result)
    );
  } catch (error) {
    next(error);
  }
};

// 🔹 Update Enquiry Status (No logic)
const updateCourseEnquiryStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ["pending", "in-progress", "closedAndWon", "closedAndLost", "closeWithOutReason"];
    if (!validStatuses.includes(status)) {
      return next(new ApiError("Invalid status value", 400));
    }

    const updated = await CourseEnquiry.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { status },
      { new: true }
    );

    if (!updated) return next(new ApiError("Course enquiry not found", 404));

    res.status(200).json(
      new ApiResponse(200, "Enquiry status updated successfully", updated)
    );
  } catch (error) {
    next(error);
  }
};

// 🔹 Soft Delete Enquiry and Mapping
const deleteCourseEnquiry = async (req, res, next) => {
  try {
    const { id } = req.params;

    const deleted = await CourseEnquiry.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { isDeleted: true },
      { new: true }
    );

    if (!deleted) {
      return next(new ApiError("Course enquiry not found or already deleted", 404));
    }

    await CourseEnquiryMapping.updateMany(
      { enquiryId: id, isDeleted: false },
      {
        isDeleted: true,
        validTo: new Date(),
      }
    );

    res.status(200).json(
      new ApiResponse(200, "Course enquiry and mapping soft-deleted successfully", deleted)
    );
  } catch (error) {
    next(error);
  }
};

// 🔹 Get Single Enquiry with Course Name
const getSingleCourseEnquiry = async (req, res, next) => {
  try {
    const { id } = req.params;

    const enquiry = await CourseEnquiry.findOne({ _id: id, isDeleted: false }).lean();
    if (!enquiry) {
      return next(new ApiError("Course enquiry not found", 404));
    }

    const mapping = await CourseEnquiryMapping.findOne({
      enquiryId: id,
      isDeleted: false,
    }).lean();

    let courseName = null;

    if (mapping?.courseId) {
      const course = await Course.findById(mapping.courseId).lean();
      courseName = course?.courseName || null;
    }

    res.status(200).json(
      new ApiResponse(200, "Course enquiry fetched successfully", {
        ...enquiry,
        courseName,
      })
    );
  } catch (error) {
    next(error);
  }
};

// 🔹 User Stats (Total Enquiries)
const getCourseEnquiryByUserId = async (req, res, next) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return next(new ApiError("Unauthorized: userId missing", 401));
    }

    const mappings = await CourseEnquiryMapping.find({
      userId,
      isDeleted: false,
    }).select("enquiryId");

    const enquiryIds = mappings.map((m) => m.enquiryId);

    const enquiries = await CourseEnquiry.find({
      _id: { $in: enquiryIds },
      isDeleted: false,
    }).select("name email message status createdAt updatedAt");

    res.status(200).json(
      new ApiResponse(200, "Course enquiries fetched", enquiries)
    );
  } catch (error) {
    next(error);
  }
};;

// 🔹 Get Count by Course
const getEnquiriesByCourseId = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    if (!courseId) {
      return next(new ApiError("courseId is required", 400));
    }

    // 1. Find all mappings for that course
    const mappings = await CourseEnquiryMapping.find({
      courseId,
      isDeleted: false,
    }).select("enquiryId");

    const enquiryIds = mappings.map((m) => m.enquiryId);

    // 2. Find all enquiries from those IDs
    const enquiries = await CourseEnquiry.find({
      _id: { $in: enquiryIds },
      isDeleted: false,
    }).select("name email message status createdAt");

    if (!enquiries.length) {
      return next(new ApiError("No enquiries found for this course", 404));
    }

    res.status(200).json(
      new ApiResponse(200, "Course enquiries fetched successfully", enquiries)
    );
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createCourseEnquiry,
  getAllCourseEnquiries,
  updateCourseEnquiryStatus,
  getSingleCourseEnquiry,
  getCourseEnquiryByUserId,
  getEnquiriesByCourseId,
  deleteCourseEnquiry,
};
