const createRoomButton = document.getElementById("create-room");
const roomResult = document.getElementById("room-result");

createRoomButton.addEventListener("click", async () => {
    const response = await fetch("/api/rooms", {
        method: "POST"
    });

    const room = await response.json();

    roomResult.textContent = `Your room code is ${room.code}`;
});