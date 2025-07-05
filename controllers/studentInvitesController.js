const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const StudentInvite = require("../models/studentInvite");
const InstituteStudentMapping = require("../models/studentInstituteMapping");
const userModel = require("../models/userModel");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const { sendMail } = require("../utils/sendMail");

// 🔹 Send Student Invites (by Institute)
const sendStudentInvites = async (req, res, next) => {
  try {
    const { emails } = req.body;
    const instituteId = req.user.userId;

    if (!emails || !Array.isArray(emails) || emails.length === 0) {
      return next(new ApiError("Please provide at least one email", 400));
    }

    for (const email of emails) {
      const token = jwt.sign({ email, instituteId }, process.env.JWT_SECRET_KEY, {
        expiresIn: "1d",
      });

      await StudentInvite.create({ email, token });

      const inviteLink = `${process.env.FRONTEND_URL}/student-registration/${token}`;

      const html = `
        <p>You’ve been invited to register as a student under your institute.</p>
        <p>Click the button below to complete your registration:</p>
        <a href="${inviteLink}" style="padding:10px 20px;background:#007BFF;color:#fff;text-decoration:none;">Register Now</a>
      `;

      await sendMail(email, "Student Registration Invitation", `Click here: ${inviteLink}`, html);
    }

    res.status(200).json(new ApiResponse(200, "Invitations sent successfully"));
  } catch (error) {
    next(error);
  }
};

// 🔹 Register Student using Invite
const registerStudentViaInvite = async (req, res, next) => {
  try {
    const { token } = req.params;
    const { userName, phone, password } = req.body;

    if (!userName || !phone || !password) {
      return next(new ApiError("All fields are required", 400));
    }

    if (!/^[6-9]\d{9}$/.test(phone)) {
      return next(new ApiError("Invalid phone number format", 400));
    }

    if (password.length < 6) {
      return next(new ApiError("Password must be at least 6 characters", 400));
    }

    // Decode token to get email & instituteId
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    const { email, instituteId } = decoded;

    const invite = await StudentInvite.findOne({ token, email, isUsed: false });
    if (!invite) return next(new ApiError("Invalid or expired invite", 400));

    const existing = await userModel.findOne({ email });
    if (existing) return next(new ApiError("User already exists with this email", 400));

    const hashedPassword = await bcrypt.hash(password, 10);

    const student = await userModel.create({
      userName,
      email,
      phone,
      password: hashedPassword,
      role: "instituteStudent",
    });

    await InstituteStudentMapping.create({
      studentId: student._id,
      instituteId,
    });

    invite.isUsed = true;
    await invite.save();

    res.status(201).json(new ApiResponse(201, "Student registered successfully", student));
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return next(new ApiError("Invitation link has expired", 400));
    }
    next(error);
  }
};


const getAllStudentsByInstituteId = async (req, res, next) => {
  try {
    const { instituteId } = req.params;

    if (!instituteId) {
      return next(new ApiError("Institute ID is required", 400));
    }

    // 1. Find all mappings for the institute
    const mappings = await InstituteStudentMapping.find({ instituteId }).lean();

    const studentIds = mappings.map((m) => m.studentId);

    // 2. Fetch student details
    const students = await User.find({
      _id: { $in: studentIds },
      role: "instituteStudent",
      isDeleted: false,
    }).lean();

    return res
      .status(200)
      .json(new ApiResponse(200, "All students fetched", students));
  } catch (error) {
    next(error);
  }
};



module.exports = {
  sendStudentInvites,
  registerStudentViaInvite,
  getAllStudentsByInstituteId
};
