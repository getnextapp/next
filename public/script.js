const onlineCounter = document.getElementById("onlineCounter");

socket.on("online-count", (count) => {
  onlineCounter.innerText = `Online: ${count}`;
});
