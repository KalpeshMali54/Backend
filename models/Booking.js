const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      index: true,
    },
    bookingCode: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    eventDetails: {
      type: Object,
      required: true,
    },
    vibeSelection: {
      type: Object,
      required: true,
    },
    customization: {
      type: Object,
      required: true,
    },
    paymentMethod: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    subtotal: {
      type: Number,
      default: 0,
      min: 0,
    },
    gst: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalPayable: {
      type: Number,
      default: 0,
      min: 0,
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled", "completed"],
      default: "pending",
      index: true,
    },
  },
  { timestamps: true },
);

bookingSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model("Booking", bookingSchema);
