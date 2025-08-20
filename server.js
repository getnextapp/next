const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

let waitingUser = null;
let onlineUsers = 0;

app.use(express.static(path.join(__dirname, "public")));

io.on("connection", (socket) => {
  onlineUsers++;
  io.emit("online-count", onlineUsers);

  if (waitingUser) {
    // Pair users
    socket.partner = waitingUser;
    waitingUser.partner = socket;

    socket.emit("message", { sender: "system", text: "Connected to a stranger!" });
    waitingUser.emit("message", { sender: "system", text: "Connected to a stranger!" });
    waitingUser = null;
  } else {
    waitingUser = socket;
    socket.emit("message", { sender: "system", text: "Waiting for a stranger..." });
  }

  // Handle text
  socket.on("message", (msg) => {
    if (socket.partner) {
      socket.partner.emit("message", { sender: "stranger", text: msg });
    }
  });

  // Handle image
  socket.on("image", (imgData) => {
    if (socket.partner) {
      socket.partner.emit("image", imgData);
    }
  });

  // Disconnect
  socket.on("disconnect", () => {
    onlineUsers--;
    io.emit("online-count", onlineUsers);

    if (socket.partner) {
      socket.partner.emit("message", { sender: "system", text: "Stranger disconnected." });
      socket.partner.partner = null;
    }
    if (waitingUser === socket) waitingUser = null;
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on ${PORT}`));
