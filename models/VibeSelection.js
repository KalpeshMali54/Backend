const mongoose = require("mongoose");

const vibeSelectionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      index: true,
    },
    selected_package_id: {
      type: String,
      required: true,
      index: true,
    },
    estimate: {
      type: Number,
      required: true,
      min: 0,
      index: true,
    },
  },
  { timestamps: true },
);

vibeSelectionSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model("VibeSelection", vibeSelectionSchema);
