const express = require("express");
const planningController = require("../controllers/planningController");
const validateRequest = require("../middleware/validateRequest");
const { optionalAuth, protect } = require("../middleware/authMiddleware");
const {
  eventDetailsValidator,
  vibeSelectionValidator,
  bookingValidator,
  createRazorpayOrderValidator,
  verifyRazorpayPaymentValidator,
} = require("../validators/planningValidators");

const router = express.Router();

router
  .route("/event-details")
  .get(optionalAuth, planningController.getEventDetails)
  .post(optionalAuth, eventDetailsValidator, validateRequest, planningController.createEventDetails);

router
  .route("/vibe-selections")
  .get(optionalAuth, planningController.getVibeSelections);

router
  .route("/vibe-selection")
  .post(optionalAuth, vibeSelectionValidator, validateRequest, planningController.createVibeSelection);

router
  .route("/bookings")
  .get(protect, planningController.getBookings)
  .post(protect, bookingValidator, validateRequest, planningController.createBooking);

router.post(
  "/bookings/:bookingId/create-order",
  protect,
  createRazorpayOrderValidator,
  validateRequest,
  planningController.createRazorpayOrder,
);

router.post(
  "/bookings/:bookingId/verify-payment",
  protect,
  verifyRazorpayPaymentValidator,
  validateRequest,
  planningController.verifyRazorpayPayment,
);

module.exports = router;
