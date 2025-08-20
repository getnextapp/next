io.on("connection", (socket) => {
  onlineUsers++;
  io.emit("online-count", onlineUsers);

  if (waitingUser) {
    // pair users
    socket.partner = waitingUser;
    waitingUser.partner = socket;

    socket.emit("message", "You are now connected to a stranger!");
    waitingUser.emit("message", "You are now connected to a stranger!");
    waitingUser = null;
  } else {
    waitingUser = socket;
    socket.emit("message", "Waiting for a stranger...");
  }

  // text message
  socket.on("message", (msg) => {
    if (socket.partner) {
      socket.partner.emit("message", msg);
    }
  });

  // image message 👇 (this is where you add it)
  socket.on("image", (imgData) => {
    if (socket.partner) socket.partner.emit("image", imgData);
  });

  // disconnect
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
