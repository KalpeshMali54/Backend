const mongoose = require("mongoose");

const eventTypeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    code: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      index: true,
    },
    icon_type: {
      type: String,
      required: true,
      trim: true,
    },
    sortOrder: {
      type: Number,
      default: 0,
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
    id: false,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

eventTypeSchema.virtual("id").get(function getId() {
  return this.code || this._id.toString();
});

module.exports = mongoose.model("EventType", eventTypeSchema);
