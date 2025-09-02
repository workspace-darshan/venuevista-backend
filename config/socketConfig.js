require("dotenv").config();
const http = require("http");
const { Server } = require("socket.io");
const { setSocketIOInstance } = require("../services/notificationService");

const initSocket = (app) => {
  const server = http.createServer(app);
  console.log("🧪 Starting socket server init...");

  server.on("error", (err) => {
    console.error(
      "\x1b[1m\x1b[41m\x1b[37m%s\x1b[0m",
      "❌ Server failed to start:"
    );
    console.error(err.message);
    process.exit(1);
  });
  let connectedUsers = {};

  const io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL_LIVE,
      methods: ["GET", "POST"],
      allowedHeaders: ["Content-Type", "Authorization"],
    },
    transports: ["websocket", "polling"],
    pingTimeout: 60000,
    pingInterval: 25000,
    allowEIO3: true,
    path: "/socket.io/"
  });

  io.on("connection", (socket) => {

    socket.on("register", (userId) => {
      connectedUsers[userId] = socket.id;
      socket.join(userId.toString());
    });

    socket.on("disconnect", () => {
      const userId = Object.keys(connectedUsers).find(
        (key) => connectedUsers[key] === socket.id
      );
      if (userId) delete connectedUsers[userId];
      console.log("🔴 User disconnected", socket.id);
    });
    socket.on("error", (error) => {
      console.error("🚨 Socket error:", error);
    });
  });

  // const SOCKET_PORT = process.env.SOCKET_PORT || 5000;
  // server.listen(SOCKET_PORT, () => {
  //   console.log(
  //     "\x1b[42m\x1b[30m%s\x1b[0m",
  //     `🔌Server is ready to take socket ==> http://localhost:${SOCKET_PORT}`
  //   );
  // });

  setSocketIOInstance(io);
  // return { server, io };
};

module.exports = initSocket;