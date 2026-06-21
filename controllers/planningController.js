const asyncHandler = require("../utils/asyncHandler");
const planningService = require("../services/planningService");

const createEventDetails = asyncHandler(async (req, res) => {
  const eventDetails = await planningService.createEventDetails(req.body, req.user?._id);
  res.status(201).json({
    success: true,
    message: "Event details saved",
    data: eventDetails,
  });
});

const getEventDetails = asyncHandler(async (req, res) => {
  const eventDetails = await planningService.listEventDetails(req.user?._id);
  res.status(200).json(eventDetails);
});

const createVibeSelection = asyncHandler(async (req, res) => {
  const vibeSelection = await planningService.createVibeSelection(req.body, req.user?._id);
  res.status(201).json({
    success: true,
    message: "Vibe selection saved",
    data: vibeSelection,
  });
});

const getVibeSelections = asyncHandler(async (req, res) => {
  const vibeSelections = await planningService.listVibeSelections(req.user?._id);
  res.status(200).json(vibeSelections);
});

const createBooking = asyncHandler(async (req, res) => {
  const booking = await planningService.createBooking(req.body, req.user?._id);
  res.status(201).json({
    success: true,
    message: "Booking created",
    data: booking,
  });
});

const getBookings = asyncHandler(async (req, res) => {
  const bookings = await planningService.listBookings(req.user?._id);
  res.status(200).json(bookings);
});

const createRazorpayOrder = asyncHandler(async (req, res) => {
  const { booking, razorpayOrder } = await planningService.createRazorpayOrder(
    req.params.bookingId,
    req.user._id,
  );

  res.status(201).json({
    success: true,
    message: "Razorpay order created",
    data: {
      bookingId: booking._id,
      bookingCode: booking.bookingCode,
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
      paymentStatus: booking.paymentStatus,
      bookingStatus: booking.status,
    },
  });
});

const verifyRazorpayPayment = asyncHandler(async (req, res) => {
  const booking = await planningService.verifyRazorpayPayment(
    req.params.bookingId,
    req.user._id,
    req.body,
  );

  res.status(200).json({
    success: true,
    message: "Payment verified",
    data: {
      bookingId: booking._id,
      bookingCode: booking.bookingCode,
      razorpayOrderId: booking.razorpayOrderId,
      razorpayPaymentId: booking.razorpayPaymentId,
      paymentStatus: booking.paymentStatus,
      status: booking.status,
    },
  });
});

module.exports = {
  createEventDetails,
  getEventDetails,
  createVibeSelection,
  getVibeSelections,
  createBooking,
  getBookings,
  createRazorpayOrder,
  verifyRazorpayPayment,
};
