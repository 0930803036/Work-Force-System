let io;

function initSocket(server) {
  const { Server } = require("socket.io");
  io = new Server(server, {
    cors: {
      origin: "*", // Change this for production!
      methods: ["GET", "POST", "PATCH", "DELETE"],
    },
  });

  io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });

  return io;
}

function getIO() {
  if (!io) {
    throw new Error("Socket.io not initialized!");
  }
  return io;
}

module.exports = {
  initSocket,
  getIO,
};
