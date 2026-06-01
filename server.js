const dotenv = require("dotenv");
dotenv.config();

const http = require("http");
const app = require("./app");
const connectDB = require("./config/db");
const { initSocket } = require("./socket");

const PORT = process.env.PORT || 3000;
let isConnecting = false;

async function connectWithRetry() {
  if (isConnecting) return;

  isConnecting = true;
  try {
    await connectDB();
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    console.error("Retrying MongoDB connection in 10 seconds...");
    setTimeout(connectWithRetry, 10000);
  } finally {
    isConnecting = false;
  }
}

async function startServer() {
  const server = http.createServer(app);
  initSocket(server);
  server.listen(PORT, () => {
    console.log(`Kventro API running on http://localhost:${PORT}`);
    connectWithRetry();
  });
}

startServer().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});
