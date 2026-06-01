const jwt = require("jsonwebtoken");
const User = require("../models/User");
const AppError = require("../utils/AppError");
const asyncHandler = require("../utils/asyncHandler");

const protect = asyncHandler(async (req, _res, next) => {
  const header = req.headers.authorization;

  if (!header?.startsWith("Bearer ")) {
    throw new AppError("Authentication token is required", 401);
  }

  const token = header.split(" ")[1];
  if (!token || token.includes("{{")) {
    throw new AppError("Authentication token is required", 401);
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const user = await User.findById(decoded.id).select("-password -refreshTokens");

  if (!user || !user.isActive) {
    throw new AppError("User is not authorized", 401);
  }

  req.user = user;
  next();
});

const optionalAuth = asyncHandler(async (req, _res, next) => {
  const header = req.headers.authorization;

  if (!header?.startsWith("Bearer ")) {
    next();
    return;
  }

  const token = header.split(" ")[1];
  if (!token || token.includes("{{")) {
    next();
    return;
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const user = await User.findById(decoded.id).select("-password -refreshTokens");

  if (user?.isActive) {
    req.user = user;
  }

  next();
});

const authorize = (...roles) => (req, _res, next) => {
  if (!roles.includes(req.user.role)) {
    throw new AppError("You do not have permission to access this resource", 403);
  }
  next();
};

module.exports = { protect, optionalAuth, authorize };
