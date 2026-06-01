function initSocket(server) {
  // The current Flutter frontend has no realtime client.
  // Socket.io is initialized as an extension point for future booking status updates.
  if (process.env.ENABLE_SOCKET_IO !== "true") {
    return null;
  }

  const { Server } = require("socket.io");
  const corsOrigin =
    !process.env.CLIENT_URL || process.env.CLIENT_URL === "*"
      ? "*"
      : process.env.CLIENT_URL.split(",");
  const io = new Server(server, {
    cors: {
      origin: corsOrigin,
      credentials: corsOrigin !== "*",
    },
  });

  io.on("connection", (socket) => {
    socket.on("joinBooking", (bookingId) => {
      socket.join(`booking:${bookingId}`);
    });
  });

  return io;
}

module.exports = { initSocket };
