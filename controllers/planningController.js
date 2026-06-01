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

module.exports = {
  createEventDetails,
  getEventDetails,
  createVibeSelection,
  getVibeSelections,
  createBooking,
  getBookings,
};
