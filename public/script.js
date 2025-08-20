const imageInput = document.getElementById("imageInput");

imageInput.addEventListener("change", () => {
  const file = imageInput.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = () => {
      socket.emit("image", reader.result); // send Base64 image
      displayImage(reader.result, "You");  // show your own image
    };
    reader.readAsDataURL(file);
  }
});

// receive image
socket.on("image", (imgData) => {
  displayImage(imgData, "Stranger");
});

// helper function
function displayImage(src, sender) {
  const chat = document.getElementById("chat");
  const img = document.createElement("img");
  img.src = src;
  img.style.maxWidth = "200px";
  img.style.display = "block";
  chat.innerHTML += `<p><b>${sender}:</b></p>`;
  chat.appendChild(img);
}
