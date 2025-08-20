let onlineUsers = 0;

io.on("connection", (socket) => {
  onlineUsers++;
  io.emit("online-count", onlineUsers);

  // ... existing chat logic ...

  socket.on("disconnect", () => {
    onlineUsers--;
    io.emit("online-count", onlineUsers);

    if (socket.partner) {
      socket.partner.emit("partner-left");
      socket.partner.partner = null;
    }
    if (waitingUser === socket) waitingUser = null;
  });
});
