const socket = io();

const messagesDiv = document.getElementById("messages");
const msgInput = document.getElementById("msgInput");
const sendBtn = document.getElementById("sendBtn");
const imgInput = document.getElementById("imgInput");
const stopBtn = document.getElementById("stopBtn");
const onlineCount = document.getElementById("online");

// Add a message to chat
function addMessage(text, type = "system", isImage = false) {
  const div = document.createElement("div");
  div.classList.add("message", type);

  if (isImage) {
    const img = document.createElement("img");
    img.src = text;
    div.appendChild(img);
  } else {
    div.textContent = text;
  }

  messagesDiv.appendChild(div);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

// Receive text
socket.on("message", (data) => {
  addMessage(data.text, data.sender);
});

// Receive image
socket.on("image", (imgData) => {
  addMessage(imgData, "stranger", true);
});

// Online count
socket.on("online-count", (count) => {
  onlineCount.textContent = `Online: ${count}`;
});

// Send text
sendBtn.addEventListener("click", () => {
  const msg = msgInput.value.trim();
  if (msg) {
    addMessage(msg, "self");
    socket.emit("message", msg);
    msgInput.value = "";
  }
});

// Enter key sends message
msgInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") sendBtn.click();
});

// Send image
imgInput.addEventListener("change", () => {
  const file = imgInput.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = () => {
      const imgData = reader.result;
      addMessage(imgData, "self", true);
      socket.emit("image", imgData);
    };
    reader.readAsDataURL(file);
  }
});

// Stop button (reloads page to disconnect & requeue)
stopBtn.addEventListener("click", () => {
  window.location.reload();
});
