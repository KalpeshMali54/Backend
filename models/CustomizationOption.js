const mongoose = require("mongoose");

const cakeOptionSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, trim: true, unique: true, index: true },
    name: { type: String, required: true, trim: true },
    price: { type: Number, default: 0, min: 0 },
    imageUrl: { type: String, required: true, trim: true },
    isIncluded: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true, id: false, toJSON: { virtuals: true }, toObject: { virtuals: true } },
);

cakeOptionSchema.virtual("id").get(function getId() {
  return this.code || this._id.toString();
});

const foodMenuCategorySchema = new mongoose.Schema(
  {
    code: { type: String, required: true, trim: true, unique: true, index: true },
    name: { type: String, required: true, trim: true },
    totalItems: { type: Number, required: true, min: 0 },
    selectedItems: { type: Number, required: true, min: 0 },
    iconType: { type: String, required: true, trim: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true, id: false, toJSON: { virtuals: true }, toObject: { virtuals: true } },
);

foodMenuCategorySchema.virtual("id").get(function getId() {
  return this.code || this._id.toString();
});

const decorationStyleSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, trim: true, unique: true, index: true },
    name: { type: String, required: true, trim: true },
    price: { type: Number, default: 0, min: 0 },
    isIncluded: { type: Boolean, default: false },
    iconType: { type: String, required: true, trim: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true, id: false, toJSON: { virtuals: true }, toObject: { virtuals: true } },
);

decorationStyleSchema.virtual("id").get(function getId() {
  return this.code || this._id.toString();
});

const premiumAddonSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, trim: true, unique: true, index: true },
    name: { type: String, required: true, trim: true },
    subtitle: { type: String, required: true, trim: true },
    price: { type: Number, default: 0, min: 0 },
    iconType: { type: String, required: true, trim: true },
    isSelected: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true, id: false, toJSON: { virtuals: true }, toObject: { virtuals: true } },
);

premiumAddonSchema.virtual("id").get(function getId() {
  return this.code || this._id.toString();
});

module.exports = {
  CakeOption: mongoose.model("CakeOption", cakeOptionSchema),
  FoodMenuCategory: mongoose.model("FoodMenuCategory", foodMenuCategorySchema),
  DecorationStyle: mongoose.model("DecorationStyle", decorationStyleSchema),
  PremiumAddon: mongoose.model("PremiumAddon", premiumAddonSchema),
};
