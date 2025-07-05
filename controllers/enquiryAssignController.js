const CourseEnquiryAssign = require("../models/courseEnquiryAssign");
const CourseEnquiryAssignMapping = require("../models/courseEnquiryAssignMapping");
const CourseEnquiry = require("../models/courseEnquiry");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const courseModel = require("../models/courseModel");
const courseEnquiryMapping = require("../models/courseEnquiryMapping");

const assignCourseEnquiry = async (req, res, next) => {
  try {
    const { enquiryId, childAdminId, priority, adminNotes } = req.body;
    const assignedBy = req.user?.role; // 

    // 🔸 Validate
    if (!enquiryId || !childAdminId || !priority) {
      return next(new ApiError("enquiryId, childAdminId, and priority are required", 400));
    }
console.log(enquiryId)
    const validPriorities = ["low", "medium", "high"];
    if (!validPriorities.includes(priority)) {
      return next(new ApiError("Invalid priority", 400));
    }

    // 🔍 Check enquiry exists
    const enquiry = await CourseEnquiry.findOne({ _id: enquiryId, isDeleted: false });
    if (!enquiry) {
      return next(new ApiError("Enquiry not found", 404));
    }

    // 🔸 Create assign master
    const assignMaster = await CourseEnquiryAssign.create({
      priority,
      adminNotes,
      assignedBy,
    });

    // 🔸 Create mapping
    const assignMapping = await CourseEnquiryAssignMapping.create({
      enquiryId,
      childAdminId,
      assignId: assignMaster._id,
    });

    res.status(201).json(
      new ApiResponse(201, "Enquiry assigned successfully", {
        assignId: assignMaster._id,
        mappingId: assignMapping._id,
      })
    );
  } catch (error) {
    next(error);
  }
};


const getAssignedEnquiriesForChildAdmin = async (req, res, next) => {
  try {
    const childAdminId = req.user?.userId;
console.log(childAdminId)
    if (!childAdminId) {
      return next(new ApiError("Unauthorized: userId missing", 401));
    }

    // Step 1: Get all mappings where this child admin is assigned
    const assignMappings = await CourseEnquiryAssignMapping.find({
      childAdminId,
      isDeleted: false,
    });

    if (!assignMappings.length) {
      return next(new ApiError("No assigned enquiries found", 404));
    }

    const enquiryIds = assignMappings.map((m) => m.enquiryId);
    const assignIds = assignMappings.map((m) => m.assignId);

    // Step 2: Get all enquiries
    const enquiries = await CourseEnquiry.find({
      _id: { $in: enquiryIds },
      isDeleted: false,
    });

    // Step 3: Get all assign master info
    const assignMasters = await CourseEnquiryAssign.find({
      _id: { $in: assignIds },
    });

    // Step 4: Get courseIds from CourseEnquiryMapping
    const mappings = await courseEnquiryMapping.find({
      enquiryId: { $in: enquiryIds },
      isDeleted: false,
    });

    const courseIds = mappings.map((m) => m.courseId);

    // Step 5: Get all course names
    const courses = await courseModel.find({ _id: { $in: courseIds } }).select("courseName");

    const courseMap = {};
    courses.forEach((c) => {
      courseMap[c._id.toString()] = c.courseName;
    });

    const enquiryMap = {};
    enquiries.forEach((e) => {
      enquiryMap[e._id.toString()] = e;
    });

    const assignMap = {};
    assignMasters.forEach((a) => {
      assignMap[a._id.toString()] = a;
    });

    const result = assignMappings.map((map) => {
      const enquiry = enquiryMap[map.enquiryId.toString()];
      const assign = assignMap[map.assignId.toString()];
      const courseMapping = mappings.find((m) => m.enquiryId.toString() === map.enquiryId.toString());
      const courseName = courseMapping ? courseMap[courseMapping.courseId.toString()] : null;

      return {
        _id: enquiry?._id,
        name: enquiry?.name,
        email: enquiry?.email,
        message: enquiry?.message,
        status: enquiry?.status,
        createdAt: enquiry?.createdAt,
        courseName: courseName,
        adminNotes: assign?.adminNotes,
        priority: assign?.priority,
        assignedBy: assign?.assignedBy,
        assignedAt: assign?.createdAt,
      };
    });

    res.status(200).json(new ApiResponse(200, "Assigned enquiries fetched successfully", result));
  } catch (error) {
    next(error);
  }
};

const getAssignedEnquiriesbyChildAdminId = async (req, res, next) => {
  try {
    const {childAdminId} = req.params;

    if (!childAdminId) {
      return next(new ApiError("Unauthorized: userId missing", 401));
    }

    // Step 1: Get all mappings where this child admin is assigned
    const assignMappings = await CourseEnquiryAssignMapping.find({
      childAdminId,
      isDeleted: false,
    });

    if (!assignMappings.length) {
      return next(new ApiError("No assigned enquiries found", 404));
    }

    const enquiryIds = assignMappings.map((m) => m.enquiryId);
    const assignIds = assignMappings.map((m) => m.assignId);
    
    // Step 2: Get all enquiries
    const enquiries = await CourseEnquiry.find({
      _id: { $in: enquiryIds },
      isDeleted: false,
    });
    // Step 3: Get all assign master info
    const assignMasters = await CourseEnquiryAssign.find({
      _id: { $in: assignIds },
    });
    // Step 4: Get courseIds from CourseEnquiryMapping
    const mappings = await courseEnquiryMapping.find({  
      enquiryId: { $in: enquiryIds },
      isDeleted: false,
    });
    const courseIds = mappings.map((m) => m.courseId);
    // Step 5: Get all course names
    const courses = await courseModel.find({ _id: { $in: courseIds } }).select("courseName");
    const courseMap = {};
    courses.forEach((c) => {
      courseMap[c._id.toString()] = c.courseName;
    });
    const enquiryMap = {};
    enquiries.forEach((e) => {
      enquiryMap[e._id.toString()] = e;
    });
    const assignMap = {}; 
    assignMasters.forEach((a) => {
      assignMap[a._id.toString()] = a;
    });
    const result = assignMappings.map((map) => {
      const enquiry = enquiryMap[map.enquiryId.toString()]; 
      const assign = assignMap[map.assignId.toString()];
      const courseMapping = mappings.find((m) => m.enquiryId.toString() === map.enquiryId.toString());
      const courseName = courseMapping ? courseMap[courseMapping.courseId.toString()] : null; 
      return {
        _id: enquiry?._id,  
        name: enquiry?.name,
        email: enquiry?.email,
        message: enquiry?.message,
        status: enquiry?.status,
        createdAt: enquiry?.createdAt,
        courseName: courseName,
        adminNotes: assign?.adminNotes,
        priority: assign?.priority,
        assignedBy: assign?.assignedBy,
        assignedAt: assign?.createdAt,
      };
    });
    res.status(200).json(new ApiResponse(200, "Assigned enquiries fetched successfully", result));
  } catch (error) {
    next(error);
  }
};

const getSingleAssignedEnquiryById = async (req, res, next) => {
  try {
    const { enquiryId } = req.params;

    if (!enquiryId) {
      return next(new ApiError("Enquiry ID is required", 400));
    }

    // Step 1: Find the mapping for the given enquiryId
    const assignMapping = await CourseEnquiryAssignMapping.findOne({
      enquiryId,
      isDeleted: false,
    });

    if (!assignMapping) {
      return next(new ApiError("No assigned enquiry found", 404));
    }

    // Step 2: Get the enquiry details
    const enquiry = await CourseEnquiry.findOne({
      _id: enquiryId,
      isDeleted: false,
    });

    if (!enquiry) {
      return next(new ApiError("Enquiry not found", 404));
    }

    // Step 3: Get the assign master details
    const assignMaster = await CourseEnquiryAssign.findOne({
      _id: assignMapping.assignId,
    });

    // Step 4: Get the course mapping for the enquiry
    const courseMapping = await courseEnquiryMapping.findOne({
      enquiryId,
      isDeleted: false,
    });

    // Step 5: Get the course name if a course mapping exists
    let courseName = null;
    if (courseMapping) {
      const course = await courseModel
        .findById(courseMapping.courseId)
        .select("courseName");
      courseName = course ? course.courseName : null;
    }

    // Step 6: Construct the response
    const result = {
      _id: enquiry._id,
      name: enquiry.name,
      email: enquiry.email,
      message: enquiry.message,
      status: enquiry.status,
      createdAt: enquiry.createdAt,
      courseName,
      adminNotes: assignMaster?.adminNotes,
      priority: assignMaster?.priority,
      assignedBy: assignMaster?.assignedBy,
      assignedAt: assignMaster?.createdAt,
      childAdminId: assignMapping.childAdminId,
    };

    res
      .status(200)
      .json(
        new ApiResponse(200, "Assigned enquiry fetched successfully", result)
      );
  } catch (error) {
    next(error);
  }
};
module.exports = {
  assignCourseEnquiry,
  getAssignedEnquiriesForChildAdmin,
  getAssignedEnquiriesbyChildAdminId,
  getSingleAssignedEnquiryById
};