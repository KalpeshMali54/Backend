const mongoose = require("mongoose");
const dns = require("dns");
const { execFileSync } = require("child_process");

function timeoutAfter(ms) {
  return new Promise((_, reject) => {
    setTimeout(() => reject(new Error(`MongoDB connection timed out after ${ms}ms`)), ms);
  });
}

function resolveSrvWithPowerShell(host) {
  const output = execFileSync(
    "powershell",
    [
      "-NoProfile",
      "-Command",
      `Resolve-DnsName "_mongodb._tcp.${host}" -Type SRV | Select-Object NameTarget,Port | ConvertTo-Json -Compress`,
    ],
    { encoding: "utf8", timeout: 7000 },
  );
  const parsed = JSON.parse(output);
  return Array.isArray(parsed) ? parsed : [parsed];
}

function buildDirectAtlasUri(uri) {
  if (!uri.startsWith("mongodb+srv://") || process.env.DISABLE_SRV_FALLBACK === "true") {
    return uri;
  }

  if (process.platform !== "win32") {
    return uri;
  }

  try {
    const parsed = new URL(uri);
    const records = resolveSrvWithPowerShell(parsed.hostname);
    const hosts = records
      .filter((record) => record.NameTarget && record.Port)
      .map((record) => `${record.NameTarget}:${record.Port}`)
      .join(",");

    if (!hosts) return uri;

    const credentials =
      parsed.username || parsed.password
        ? `${parsed.username}${parsed.password ? `:${parsed.password}` : ""}@`
        : "";
    const database = parsed.pathname || "";
    const params = new URLSearchParams(parsed.search);

    if (!params.has("tls")) params.set("tls", "true");
    if (!params.has("retryWrites")) params.set("retryWrites", "true");
    if (!params.has("w")) params.set("w", "majority");

    console.log("Using Windows SRV fallback for MongoDB Atlas host resolution");
    return `mongodb://${credentials}${hosts}${database}?${params.toString()}`;
  } catch (error) {
    console.warn(`MongoDB SRV fallback failed: ${error.message}`);
    return uri;
  }
}

async function connectDB() {
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is required. Add your MongoDB Atlas URI to .env");
  }

  mongoose.set("strictQuery", true);
  mongoose.set("bufferCommands", false);
  dns.setServers((process.env.DNS_SERVERS || "8.8.8.8,1.1.1.1").split(","));

  try {
    const mongoUri = buildDirectAtlasUri(process.env.MONGO_URI);
    const connection = await Promise.race([
      mongoose.connect(mongoUri, {
        serverSelectionTimeoutMS: 5000,
        connectTimeoutMS: 5000,
        socketTimeoutMS: 10000,
        maxPoolSize: 10,
        family: 4,
      }),
      timeoutAfter(6000),
    ]);
    console.log(`MongoDB connected: ${connection.connection.host}`);
  } catch (error) {
    await mongoose.disconnect().catch(() => {});
    if (
      /timed out|ENOTFOUND|querySrv|ECONNREFUSED|ETIMEDOUT|server selection/i.test(
        error.message,
      )
    ) {
      error.message = `${error.message}. MongoDB Atlas is not reachable from this machine. Check Atlas Network Access IP allowlist, internet/firewall access to port 27017, and MONGO_URI.`;
    }
    throw error;
  }
}

module.exports = connectDB;
