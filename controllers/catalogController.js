const asyncHandler = require("../utils/asyncHandler");
const catalogService = require("../services/catalogService");

const getServices = asyncHandler(async (_req, res) => {
  const services = await catalogService.listServices();
  res.status(200).json(services);
});

const getPackages = asyncHandler(async (req, res) => {
  const packages = await catalogService.listFeaturedPackages(req.query);
  res.status(200).json(packages);
});

const getEventTypes = asyncHandler(async (_req, res) => {
  const eventTypes = await catalogService.listEventTypes();
  res.status(200).json(eventTypes);
});

const getVibePackages = asyncHandler(async (req, res) => {
  const packages = await catalogService.listVibePackages(req.query);
  res.status(200).json(packages);
});

const getCustomizationOptions = asyncHandler(async (_req, res) => {
  const options = await catalogService.getCustomizationOptions();
  res.status(200).json(options);
});

module.exports = {
  getServices,
  getPackages,
  getEventTypes,
  getVibePackages,
  getCustomizationOptions,
};
