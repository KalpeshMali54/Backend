const AppError = require("../utils/AppError");

function notFound(req, _res, next) {
  next(new AppError(`Route not found: ${req.method} ${req.originalUrl}`, 404));
}

function errorHandler(error, _req, res, _next) {
  let statusCode = error.statusCode || 500;
  let message = error.message || "Internal server error";

  if (error.name === "CastError") {
    statusCode = 400;
    message = "Invalid resource id";
  }

  if (error.code === 11000) {
    statusCode = 409;
    message = "Duplicate value already exists";
  }

  if (error.name === "ValidationError") {
    statusCode = 400;
    message = Object.values(error.errors)
      .map((item) => item.message)
      .join(", ");
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === "development" && { stack: error.stack }),
  });
}

module.exports = { notFound, errorHandler };
