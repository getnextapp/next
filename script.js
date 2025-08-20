const socket = io();
const chat = document.getElementById("chat");
const status = document.getElementById("status");
const messageInput = document.getElementById("message");
const sendBtn = document.getElementById("send");
const stopBtn = document.getElementById("stop");

function addMessage(text, cls = "") {
  const div = document.createElement("div");
  div.textContent = text;
  if (cls) div.className = cls;
  chat.appendChild(div);
  chat.scrollTop = chat.scrollHeight;
}

socket.on("waiting", () => {
  status.textContent = "Waiting for a partner...";
});

socket.on("partner-found", () => {
  status.textContent = "Connected! Say hi 👋";
});

socket.on("message", (msg) => {
  addMessage("Stranger: " + msg, "stranger");
});

socket.on("partner-left", () => {
  status.textContent = "Partner left. Click stop or refresh.";
  addMessage("Partner disconnected ❌");
});

sendBtn.onclick = () => {
  const msg = messageInput.value;
  if (msg.trim()) {
    socket.emit("message", msg);
    addMessage("You: " + msg, "you");
    messageInput.value = "";
  }
};

stopBtn.onclick = () => {
  socket.emit("
