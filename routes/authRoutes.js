const express = require("express");
const authController = require("../controllers/authController");
const validateRequest = require("../middleware/validateRequest");
const { protect } = require("../middleware/authMiddleware");
const {
  registerValidator,
  loginValidator,
  refreshValidator,
} = require("../validators/authValidators");

const router = express.Router();

router.post("/register", registerValidator, validateRequest, authController.register);
router.post("/login", loginValidator, validateRequest, authController.login);
router.post("/refresh", refreshValidator, validateRequest, authController.refresh);
router.post("/logout", protect, authController.logout);
router.get("/me", protect, authController.me);

module.exports = router;
