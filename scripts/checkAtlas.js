require("dotenv").config();

const dns = require("dns").promises;
const dnsNative = require("dns");
const net = require("net");
const { execFileSync } = require("child_process");

dnsNative.setServers((process.env.DNS_SERVERS || "8.8.8.8,1.1.1.1").split(","));

function getAtlasHost(uri) {
  const match = uri?.match(/@([^/]+)/);
  return match?.[1];
}

function canConnect(host, port, timeoutMs = 5000) {
  return new Promise((resolve) => {
    const socket = net.createConnection({ host, port });
    const done = (ok, message) => {
      socket.destroy();
      resolve({ host, port, ok, message });
    };

    socket.setTimeout(timeoutMs);
    socket.once("connect", () => done(true, "connected"));
    socket.once("timeout", () => done(false, "timeout"));
    socket.once("error", (error) => done(false, error.message));
  });
}

function withTimeout(promise, ms, message) {
  return Promise.race([
    promise,
    new Promise((_, reject) => {
      setTimeout(() => reject(new Error(message)), ms);
    }),
  ]);
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

async function main() {
  const host = getAtlasHost(process.env.MONGO_URI);

  if (!host) {
    console.error("Could not parse MongoDB Atlas host from MONGO_URI");
    process.exit(1);
  }

  console.log(`Atlas host: ${host}`);

  let srvRecords;
  try {
    srvRecords = await withTimeout(
      dns.resolveSrv(`_mongodb._tcp.${host}`),
      5000,
      "Timed out resolving MongoDB Atlas SRV records",
    );
  } catch (error) {
    if (process.platform !== "win32") throw error;
    console.log(`${error.message}; trying Windows DNS fallback`);
    srvRecords = resolveSrvWithPowerShell(host).map((record) => ({
      name: record.NameTarget,
      port: record.Port,
    }));
  }
  console.log(`SRV records found: ${srvRecords.length}`);

  let okCount = 0;
  for (const record of srvRecords) {
    const result = await canConnect(record.name, record.port);
    if (result.ok) okCount += 1;
    console.log(`${result.ok ? "OK" : "FAIL"} ${record.name}:${record.port} ${result.message}`);
  }

  process.exit(okCount > 0 ? 0 : 1);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
