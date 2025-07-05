// ======================== CONTROLLERS/auth.controller.js ========================
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const userModel = require("../models/userModel");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const { sendMail } = require("../utils/sendMail");
require("dotenv").config();

// SIGNUP
const signUp = async (req, res, next) => {
  try {
    const { email, userName, password, phone, userType  } = req.body;
    if (!email || !phone || !password || !userName)
      return next(new ApiError("Missing required fields", 400));

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    if (!emailRegex.test(email)) {
      return next(new ApiError("Invalid email format", 400));
    }

    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(phone))
      return next(new ApiError("Invalid phone number", 400));

    if (password.length < 6)
      return next(new ApiError("Password must be at least 6 characters", 400));

    const isUserExists = await userModel.findOne({
      $or: [{ email }, { phone }],
    });
    if (isUserExists)
      return next(
        new ApiError(
          isUserExists.email === email
            ? "Email already exists"
            : "Phone already exists",
          400
        )
      );

    const hashPassword = await bcrypt.hash(
      password,
      Number(process.env.SALT_ROUNDS || 10)
    );
    const userCount = await userModel.countDocuments();
    const role = userCount === 0 ? "admin" :  userType?.toLowerCase();

    const newUser = new userModel({
      email,
      userName,
      password: hashPassword,
      role,
      phone,
    });
    const savedUser = await newUser.save();

    res
      .status(200)
      .json(new ApiResponse(200, "Register successfully complete", savedUser));
  } catch (error) {
    next(error);
  }
};

// LOGIN
const login = async (req, res, next) => {
  try {
    const { contact, password } = req.body;

    //  1. Empty field check
    if (!contact || !password) {
      return next(new ApiError("Email/Phone and Password are required", 400));
    }

    //  2. Email/Phone format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    const phoneRegex = /^[6-9]\d{9}$/;

    if (!emailRegex.test(contact) && !phoneRegex.test(contact)) {
      return next(new ApiError("Invalid email or phone format", 400));
    }

    //  3. Password length check
    if (password.length < 6) {
      return next(new ApiError("Password must be at least 6 characters", 400));
    }

    // 🔎 4. Find user with password (select: false in schema)
    const isUserExist = await userModel
      .findOne({ $or: [{ email: contact }, { phone: contact }] })
      .select("+password");

    if (!isUserExist) {
      return next(new ApiError("User not found", 404));
    }

    // 🔐 5. Verify password
    const verifyPassword = await bcrypt.compare(password, isUserExist.password);
    if (!verifyPassword) {
      return next(new ApiError("Password is invalid", 401));
    }

    // 🧾 6. Create access and
    const token = jwt.sign(
      {
        userId: isUserExist._id,
        role: isUserExist.role,
        userName: isUserExist.userName,
      },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "365d" }
    );

    // 🧼 8. Remove password before sending user
    const { password: _, ...userWithoutPassword } = isUserExist.toObject();
    userWithoutPassword.token = token;
    res
      .status(200)
      .json(new ApiResponse(200, "Login successful", userWithoutPassword));
  } catch (error) {
    next(error);
  }
};

// internal user

const addChildAdmin = async (req, res, next) => {
  try {
    const { userName, email, phone, password } = req.body;

    // Validate required fields
    if (!email || !phone || !password || !userName) {
      return next(new ApiError("Missing required fields", 400));
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    if (!emailRegex.test(email)) {
      return next(new ApiError("Invalid email format", 400));
    }

    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(phone)) {
      return next(new ApiError("Invalid phone number", 400));
    }

    if (password.length < 6) {
      return next(new ApiError("Password must be at least 6 characters", 400));
    }

    const isUserExists = await userModel.findOne({
      $or: [{ email }, { phone }],
    });

    if (isUserExists) {
      return next(
        new ApiError(
          isUserExists.email === email
            ? "Email already exists."
            : "Phone already exists.",
          409
        )
      );
    }

    const hashPassword = await bcrypt.hash(
      password,
      Number(process.env.SALT_ROUNDS || 10)
    );

    const newUser = new userModel({
      userName,
      email,
      phone,
      password: hashPassword,
      role: "childAdmin", // Force only childAdmin role
      userProfilePic:
        "https://www.shareicon.net/data/128x128/2016/09/15/829466_man_512x512.png",
    });

    const savedUser = await newUser.save();

    // ==================== Email Content ====================
    const textContent = `
Hello ${savedUser.userName},

Your internal user account has been successfully created.

Thanks & Regards,
PropMetaVerse
    `;

    const htmlContent = `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e0e0e0; padding: 20px;">
  <div style="text-align: center;">
    <img src="https://propmetaverse.com/assets/logopng-BXERHkCM.png" alt="Company Logo" width="120" style="margin-bottom: 20px;" />
    <h2 style="color: #2c3e50;">Man Power</h2>
    <p style="color: #555;">Universal Business Management System</p>
  </div>

  <hr />

  <p>Hi ${savedUser.userName},</p>
  <p>Your account has been created for PropMetaVerse.</p>
  <p>Your email is ${savedUser.email}</p>
  <p>Your password is <b>${password}</b></p>
  <p>Please <a href="#">click here</a> to login and set your password securely.</p>

  <p>If you didn’t request this, you can safely ignore this email.</p>

  <br />
  <hr />

  <div style="text-align: center; color: #888;">
    <p>Man Power Pvt Ltd</p>
    <p>123 Universal Business Management, Pune, India</p>
    <p><a href="https://propmetaverse.com" style="color: #007BFF;">www.propmetaverse.com</a></p>
  </div>
</div>
    `;

    await sendMail(
      savedUser.email,
      "Internal User Account Created",
      textContent,
      htmlContent
    );

    // ==================== Response ====================
    return res
      .status(200)
      .json(
        new ApiResponse(200, "Child Admin created successfully", savedUser)
      );
  } catch (error) {
    next(error);
  }
};


// GET ALL INSTITUTES
const getAllInstitutes = async (req, res, next) => {
  try {
    const institutes = await userModel.find({
      role: "institute",
      isDeleted: false,
    })

    res.status(200).json(new ApiResponse(200, "All institutes fetched successfully", institutes));
  } catch (error) {
    next(error);
  }
};

// GET ALL INSTITUTES
const getAllChildAdmin = async (req, res, next) => {
  try {
    const childAdmins = await userModel.find({
      role: "childAdmin",
      isDeleted: false,
    })

    res.status(200).json(new ApiResponse(200, "All childAdmin fetched successfully", childAdmins));
  } catch (error) {
    next(error);
  }
};


// GET ALL INSTITUTES
const getAllStudent = async (req, res, next) => {
  try {
    const students = await userModel.find({
      role: "student",
      isDeleted: false,
    })

    res.status(200).json(new ApiResponse(200, "All student fetched successfully", students));
  } catch (error) {
    next(error);
  }
};



const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { userName, email, phone, userProfilePic, password } = req.body;

    // === VALIDATIONS ===
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    if (email && !emailRegex.test(email)) {
      return next(new ApiError("Invalid email format", 400));
    }

    const phoneRegex = /^[6-9]\d{9}$/;
    if (phone && !phoneRegex.test(phone)) {
      return next(new ApiError("Invalid phone number", 400));
    }

    if (password && password.length < 6) {
      return next(new ApiError("Password must be at least 6 characters", 400));
    }

    // === PREPARE UPDATE DATA ===
    const updateData = { userName, email, phone, userProfilePic };

    if (password) {
      const hashedPassword = await bcrypt.hash(
        password,
        Number(process.env.SALT_ROUNDS || 10)
      );
      updateData.password = hashedPassword;
    }

    // === UPDATE OPERATION ===
    const updatedUser = await userModel.findOneAndUpdate(
      { _id: id, isDeleted: false },
      updateData,
      { new: true }
    )

    if (!updatedUser) {
      return next(new ApiError("User not found or already deleted", 404));
    }

    res
      .status(200)
      .json(new ApiResponse(200, "User updated successfully", updatedUser));
  } catch (error) {
    next(error);
  }
};


// DELETE USER (Soft Delete)
const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    const deletedUser = await userModel.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { isDeleted: true, isActive:false },
      { new: true }
    );

    if (!deletedUser) {
      return next(new ApiError("User not found or already deleted", 404));
    }

    res.status(200).json(new ApiResponse(200, "User deleted successfully", deletedUser));
  } catch (error) {
    next(error);
  }
};


// GET SINGLE USER BY ID
const getSingleUserById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await userModel
      .findOne({ _id: id, isDeleted: false })
     

    if (!user) {
      return next(new ApiError("User not found", 404));
    }

    res
      .status(200)
      .json(new ApiResponse(200, "User fetched successfully", user));
  } catch (error) {
    next(error);
  }
};

// 🔹 Forgot Password Controller
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    // 🔍 Validate input
    if (!email) {
      return next(new ApiError("Email is required", 400));
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    if (!emailRegex.test(email)) {
      return next(new ApiError("Invalid email format", 400));
    }

    const user = await userModel.findOne({ email, isDeleted: false });

    if (!user) {
      return next(new ApiError("No user found with this email", 404));
    }

    if (user.isGoogleUser) {
      return res.status(400).json(
        new ApiResponse(
          400,
          "This account is registered with Google login. You cannot reset password."
        )
      );
    }

    const token = jwt.sign(
      {
        id: user._id,
        userName: user.userName,
        email: user.email,
      },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "5m" }
    );

    const resetLink = `${process.env.FRONTEND_URL}/reset-password/${token}`;

    const textContent = `Hi ${user.userName},\nReset your password here: ${resetLink}`;
    const htmlContent = `
      <div style="font-family:sans-serif; max-width:600px; margin:auto;">
        <h2>Reset your password</h2>
        <p>Hello ${user.userName},</p>
        <p>Click the button below to reset your password:</p>
        <a href="${resetLink}" style="display:inline-block; padding:10px 20px; background:#007BFF; color:white; border-radius:5px;">Reset Password</a>
        <p>If you didn’t request this, you can ignore this email.</p>
      </div>
    `;

    await sendMail(user.email, "Reset your password", textContent, htmlContent);

    return res
      .status(200)
      .json(new ApiResponse(200, "Reset link sent to your registered email"));
  } catch (error) {
    next(error);
  }
};


// 🔹 Reset Password Controller
const resetPassword = async (req, res, next) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password) {
      return next(new ApiError("Password is required", 400));
    }

    if (password.length < 6) {
      return next(new ApiError("Password must be at least 6 characters", 400));
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    } catch (err) {
      return next(new ApiError("Invalid or expired reset token", 400));
    }

    const user = await userModel.findOne({ _id: decoded.id, isDeleted: false });

    if (!user) {
      return next(new ApiError("User not found", 404));
    }

    if (user.isGoogleUser) {
      return res.status(400).json(
        new ApiResponse(
          400,
          "This account is registered with Google login. You cannot reset password."
        )
      );
    }

    const hashedPassword = await bcrypt.hash(
      password,
      Number(process.env.SALT_ROUNDS || 10)
    );

    await userModel.findByIdAndUpdate(user._id, {
      password: hashedPassword,
    });

    return res
      .status(200)
      .json(new ApiResponse(200, "Password reset successful"));
  } catch (error) {
    next(error);
  }
};


module.exports = { signUp, login, addChildAdmin ,getAllInstitutes ,getAllStudent ,updateUser ,deleteUser,getSingleUserById ,getAllChildAdmin ,forgotPassword,
  resetPassword};
