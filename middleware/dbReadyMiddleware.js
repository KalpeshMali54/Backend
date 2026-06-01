const mongoose = require("mongoose");
const AppError = require("../utils/AppError");

function requireDatabase(_req, _res, next) {
  if (mongoose.connection.readyState === 1) {
    next();
    return;
  }

  next(
    new AppError(
      "Database is not connected yet. Check MONGO_URI, MongoDB Atlas network access, and backend logs.",
      503,
    ),
  );
}

module.exports = requireDatabase;
