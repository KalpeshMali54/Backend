const Service = require("../models/Service");
const FeaturedPackage = require("../models/FeaturedPackage");
const EventType = require("../models/EventType");
const VibePackage = require("../models/VibePackage");
const {
  CakeOption,
  FoodMenuCategory,
  DecorationStyle,
  PremiumAddon,
} = require("../models/CustomizationOption");

function getPaging(query) {
  const page = Math.max(Number(query.page || 1), 1);
  const limit = Math.min(Math.max(Number(query.limit || 50), 1), 100);
  return { page, limit, skip: (page - 1) * limit };
}

async function listServices() {
  return Service.find({ isActive: true }).sort({ sortOrder: 1, createdAt: 1 }).lean();
}

async function listFeaturedPackages(query) {
  const { limit, skip } = getPaging(query);
  const filter = { isActive: true };

  if (query.search) {
    filter.$text = { $search: query.search };
  }

  if (query.minPrice || query.maxPrice) {
    filter.price = {};
    if (query.minPrice) filter.price.$gte = Number(query.minPrice);
    if (query.maxPrice) filter.price.$lte = Number(query.maxPrice);
  }

  return FeaturedPackage.find(filter)
    .sort({ rating: -1, createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();
}

async function listEventTypes() {
  return EventType.find({ isActive: true }).sort({ sortOrder: 1, createdAt: 1 });
}

async function listVibePackages(query) {
  const filter = { isActive: true };
  if (query.tier) filter.tier = query.tier;

  return VibePackage.find(filter).sort({ price: 1, createdAt: 1 });
}

async function getCustomizationOptions() {
  const [cakeOptions, foodCategories, decorationStyles, premiumAddons] = await Promise.all([
    CakeOption.find({ isActive: true }).sort({ price: 1 }),
    FoodMenuCategory.find({ isActive: true }).sort({ createdAt: 1 }),
    DecorationStyle.find({ isActive: true }).sort({ price: 1 }),
    PremiumAddon.find({ isActive: true }).sort({ price: 1 }),
  ]);

  return {
    cakeOptions,
    foodCategories,
    decorationStyles,
    premiumAddons,
  };
}

module.exports = {
  listServices,
  listFeaturedPackages,
  listEventTypes,
  listVibePackages,
  getCustomizationOptions,
};
