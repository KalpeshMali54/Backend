const mongoose = require("mongoose");

const eventPlanSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      index: true,
    },
    event_type_id: {
      type: String,
      required: true,
      index: true,
    },
    event_type_title: {
      type: String,
      trim: true,
    },
    guest_count: {
      type: Number,
      required: true,
      min: 1,
      index: true,
    },
    date: {
      type: Date,
      required: true,
      index: true,
    },
    time: {
      type: String,
      required: true,
      trim: true,
    },
    budget: {
      type: Number,
      required: true,
      min: 0,
      index: true,
    },
    location: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
  },
  { timestamps: true },
);

eventPlanSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model("EventPlan", eventPlanSchema);
