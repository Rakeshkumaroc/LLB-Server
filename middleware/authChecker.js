const ApiError = require("../utils/ApiError");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const userModel = require("../models/userModel");

const tokenChecker = async (req, res, next) => {
  try {
    //  Get token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return next(new ApiError("token missing", 401));
    }

    const token = authHeader.split(" ")[1]; // Get token part

    //  Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

    // 🔍 Check if user exists and not deleted
    const user = await userModel.findById(decoded.userId);
    if (!user || user.isDeleted) {
      return next(new ApiError("User not valid or deleted", 401));
    }

    //  Attach user info to request
    req.user = decoded;

    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return next(new ApiError("Access token expired", 401));
    }

    return next(new ApiError("Unauthorized - Invalid token", 401));
  }
};

// 🔐 Role Checker
const allowRoles = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user?.role)) {
      return res.status(403).json({ message: "Access denied" });
    }
    next();
  };
};

module.exports = { tokenChecker, allowRoles };
