const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");

const apiRoutes = require("./routes");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");

const app = express();
const corsOrigin =
  !process.env.CLIENT_URL || process.env.CLIENT_URL === "*"
    ? "*"
    : process.env.CLIENT_URL.split(",");

app.set("trust proxy", 1);

app.use(helmet());
app.use(
  cors({
    origin: corsOrigin,
    credentials: corsOrigin !== "*",
  }),
);
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== "test") {
  app.use(morgan("dev"));
}

app.use(
  "/api",
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300,
    standardHeaders: true,
    legacyHeaders: false,
  }),
);

app.get("/", (_req, res) => {
  res.status(200).json({
    app: "Kventro API",
    status: "running",
    baseUrl: "/api",
  });
});

app.use("/api", apiRoutes);

// Keep Postman forgiving while the Flutter app uses /api through ApiService.
app.use("/", apiRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
