const { validationResult } = require("express-validator");
const AppError = require("../utils/AppError");

function validateRequest(req, _res, next) {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const message = errors
      .array()
      .map((error) => `${error.path}: ${error.msg}`)
      .join(", ");
    throw new AppError(message, 400);
  }

  next();
}

module.exports = validateRequest;
