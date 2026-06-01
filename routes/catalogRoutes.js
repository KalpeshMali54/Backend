const express = require("express");
const catalogController = require("../controllers/catalogController");

const router = express.Router();

router.get("/services", catalogController.getServices);
router.get("/packages", catalogController.getPackages);
router.get("/event-types", catalogController.getEventTypes);
router.get("/vibe-packages", catalogController.getVibePackages);
router.get("/customization-options", catalogController.getCustomizationOptions);

module.exports = router;
