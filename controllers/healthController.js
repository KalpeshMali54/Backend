const mongoose = require("mongoose");
const asyncHandler = require("../utils/asyncHandler");

const health = asyncHandler(async (_req, res) => {
  res.status(200).json({
    ok: true,
    app: "Kventro API",
    database: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
    databaseReadyState: mongoose.connection.readyState,
    timestamp: new Date().toISOString(),
  });
});

module.exports = { health };
