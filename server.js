const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

let waitingUser = null;
let onlineUsers = 0;

app.use(express.static("public"));

io.on("connection", (socket) => {
  onlineUsers++;
  io.emit("online-count", onlineUsers);

  // Matchmaking
  if (waitingUser) {
    socket.partner = waitingUser;
    waitingUser.partner = socket;

    socket.emit("message", "✅ You are now connected to a stranger!");
    waitingUser.emit("message", "✅ You are now connected to a stranger!");
    waitingUser = null;
  } else {
    waitingUser = socket;
    socket.emit("message", "⌛ Waiting for a stranger...");
  }

  // Text messages
  socket.on("message", (msg) => {
    if (socket.partner) socket.partner.emit("message", msg);
  });

  // Images
  socket.on("image", (imgData) => {
    if (socket.partner) socket.partner.emit("image", imgData);
  });

  // Skip button → disconnect partner and rematch
  socket.on("skip", () => {
    if (socket.partner) {
      socket.partner.emit("message", "⚠️ Your partner skipped.");
      socket.partner.partner = null;
    }
    socket.partner = null;

    if (waitingUser) {
      socket.partner = waitingUser;
      waitingUser.partner = socket;
      socket.emit("message", "✅ You are now connected to a new stranger!");
      waitingUser.emit("message", "✅ You are now connected to a new stranger!");
      waitingUser = null;
    } else {
      waitingUser = socket;
      socket.emit("message", "⌛ Waiting for a stranger...");
    }
  });

  // Disconnect
  socket.on("disconnect", () => {
    onlineUsers--;
    io.emit("online-count", onlineUsers);

    if (socket.partner) {
      socket.partner.emit("message", "⚠️ Stranger disconnected.");
      socket.partner.partner = null;
    }
    if (waitingUser === socket) waitingUser = null;
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
