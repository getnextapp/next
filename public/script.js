const socket = io();

const chatBox = document.getElementById("chat-box");
const form = document.getElementById("chat-form");
const input = document.getElementById("message");
const imageInput = document.getElementById("image-input");
const skipBtn = document.getElementById("skip");
const onlineCount = document.getElementById("online-count");

function addMessage(text, type = "system") {
  const div = document.createElement("div");
  div.classList.add("message", type);
  div.textContent = text;
  chatBox.appendChild(div);
  chatBox.scrollTop = chatBox.scrollHeight;
}

// Handle text messages
form.addEventListener("submit", (e) => {
  e.preventDefault();
  if (input.value) {
    socket.emit("message", input.value);
    addMessage(input.value, "user");
    input.value = "";
  }
});

// Handle image sending
imageInput.addEventListener("change", () => {
  const file = imageInput.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    socket.emit("image", reader.result);

    const img = document.createElement("img");
    img.src = reader.result;
    img.style.maxWidth = "200px";
    img.style.display = "block";
    chatBox.appendChild(img);
    chatBox.scrollTop = chatBox.scrollHeight;
  };
  reader.readAsDataURL(file);

  // clear input so it can be re-used
  imageInput.value = "";
});

// Skip button
skipBtn.addEventListener("click", () => {
  socket.emit("skip");
  addMessage("⏭ You skipped. Searching for a new partner...", "system");
});

// Incoming messages
socket.on("message", (msg) => {
  addMessage(msg, "stranger");
});

// Incoming images
socket.on("image", (imgData) => {
  const img = document.createElement("img");
  img.src = imgData;
  img.style.maxWidth = "200px";
  img.style.display = "block";
  chatBox.appendChild(img);
  chatBox.scrollTop = chatBox.scrollHeight;
});

// Update online count
socket.on("online-count", (count) => {
  onlineCount.textContent = `Online: ${count}`;
});
