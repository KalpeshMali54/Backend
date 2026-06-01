const { body } = require("express-validator");

const eventDetailsValidator = [
  body("event_type_id").isString().trim().notEmpty(),
  body("event_type_title").optional().isString().trim(),
  body("guest_count").isInt({ min: 1 }).toInt(),
  body("date").isISO8601().toDate(),
  body("time").isString().trim().notEmpty(),
  body("budget").isFloat({ min: 0 }).toFloat(),
  body("location").isString().trim().notEmpty(),
];

const vibeSelectionValidator = [
  body("selected_package_id").isString().trim().notEmpty(),
  body("estimate").isFloat({ min: 0 }).toFloat(),
];

const bookingValidator = [
  body("eventDetails").isObject(),
  body("vibeSelection").isObject(),
  body("customization").isObject(),
  body("paymentMethod").isString().trim().notEmpty(),
  body("subtotal").optional().isFloat({ min: 0 }).toFloat(),
];

module.exports = {
  eventDetailsValidator,
  vibeSelectionValidator,
  bookingValidator,
};
