const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

let waitingUser = null;

io.on('connection', (socket) => {
  console.log('connected:', socket.id);

  if (waitingUser) {
    pairUsers(socket, waitingUser);
    waitingUser = null;
  } else {
    waitingUser = socket;
    socket.emit('waiting', 'Waiting for a partner...');
  }

  socket.on('message', (msg) => {
    if (socket.partner) socket.partner.emit('message', msg);
  });

  socket.on('next', () => {
    if (socket.partner) {
      socket.partner.emit('message', 'Your partner left.');
      socket.partner.partner = null;
    }
    socket.partner = null;

    if (waitingUser) {
      pairUsers(socket, waitingUser);
      waitingUser = null;
    } else {
      waitingUser = socket;
      socket.emit('waiting', 'Waiting for a partner...');
    }
  });

  socket.on('stop', () => {
    if (socket.partner) {
      socket.partner.emit('message', 'Your partner ended the chat.');
      socket.partner.partner = null;
    }
    socket.partner = null;
    socket.emit('waiting', 'Chat ended. You can close the tab.');
  });

  socket.on('disconnect', () => {
    console.log('disconnect:', socket.id);
    if (socket.partner) {
      socket.partner.emit('message', 'Your partner disconnected.');
      socket.partner.partner = null;
    }
    if (waitingUser === socket) waitingUser = null;
  });
});

function pairUsers(a, b) {
  a.partner = b;
  b.partner = a;
  a.emit('chat start', 'You are now chatting!');
  b.emit('chat start', 'You are now chatting!');
}

app.use(express.static('public'));

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
