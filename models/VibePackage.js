const mongoose = require("mongoose");

const packageFeatureSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    icon_type: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { _id: false },
);

const vibePackageSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    code: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      index: true,
    },
    subtitle: {
      type: String,
      default: "",
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
      index: true,
    },
    tier: {
      type: String,
      enum: ["Starter", "Standard", "Elite"],
      default: "Standard",
      index: true,
    },
    badgeText: {
      type: String,
      trim: true,
    },
    buttonText: {
      type: String,
      required: true,
      trim: true,
    },
    backgroundImageUrl: {
      type: String,
      trim: true,
    },
    features: {
      type: [packageFeatureSchema],
      default: [],
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

vibePackageSchema.virtual("id").get(function getId() {
  return this.code || this._id.toString();
});

module.exports = mongoose.model("VibePackage", vibePackageSchema);
