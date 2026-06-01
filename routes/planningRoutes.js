const express = require("express");
const planningController = require("../controllers/planningController");
const validateRequest = require("../middleware/validateRequest");
const { optionalAuth } = require("../middleware/authMiddleware");
const {
  eventDetailsValidator,
  vibeSelectionValidator,
  bookingValidator,
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
  .get(optionalAuth, planningController.getBookings)
  .post(optionalAuth, bookingValidator, validateRequest, planningController.createBooking);

module.exports = router;
