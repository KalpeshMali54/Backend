const { body } = require("express-validator");

const registerValidator = [
  body("name").optional().isString().trim().isLength({ max: 80 }),
  body("phone").optional().isString().trim().isLength({ min: 8, max: 20 }),
  body("email").optional().isEmail().normalizeEmail(),
  body("password").isString().isLength({ min: 6 }),
  body().custom((value) => {
    if (!value.phone && !value.email) {
      throw new Error("phone or email is required");
    }
    return true;
  }),
];

const loginValidator = [
  body("identifier").isString().trim().notEmpty(),
  body("password").isString().notEmpty(),
];

const refreshValidator = [
  body("refreshToken").isString().notEmpty(),
];

module.exports = {
  registerValidator,
  loginValidator,
  refreshValidator,
};
