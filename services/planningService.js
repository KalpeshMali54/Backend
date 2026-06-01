const EventPlan = require("../models/EventPlan");
const VibeSelection = require("../models/VibeSelection");
const Booking = require("../models/Booking");

async function createEventDetails(data, userId) {
  return EventPlan.create({
    ...data,
    user: userId,
  });
}

async function listEventDetails(userId) {
  const filter = userId ? { user: userId } : {};
  return EventPlan.find(filter).sort({ createdAt: -1 }).lean();
}

async function createVibeSelection(data, userId) {
  return VibeSelection.create({
    ...data,
    user: userId,
  });
}

async function listVibeSelections(userId) {
  const filter = userId ? { user: userId } : {};
  return VibeSelection.find(filter).sort({ createdAt: -1 }).lean();
}

async function createBooking(data, userId) {
  const subtotal = Number(data.subtotal || 0);
  const gst = Number((subtotal * 0.18).toFixed(2));

  return Booking.create({
    ...data,
    user: userId,
    bookingCode: `KV-${Date.now().toString().slice(-6)}`,
    subtotal,
    gst,
    totalPayable: Number((subtotal + gst).toFixed(2)),
  });
}

async function listBookings(userId) {
  const filter = userId ? { user: userId } : {};
  return Booking.find(filter).sort({ createdAt: -1 }).lean();
}

module.exports = {
  createEventDetails,
  listEventDetails,
  createVibeSelection,
  listVibeSelections,
  createBooking,
  listBookings,
};
