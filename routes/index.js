const express = require("express");
const { health } = require("../controllers/healthController");
const authRoutes = require("./authRoutes");
const catalogRoutes = require("./catalogRoutes");
const planningRoutes = require("./planningRoutes");
const requireDatabase = require("../middleware/dbReadyMiddleware");

const router = express.Router();

router.get("/health", health);
router.use(requireDatabase);
router.use("/auth", authRoutes);
router.use("/", catalogRoutes);
router.use("/", planningRoutes);

module.exports = router;
