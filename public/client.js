const createRoomButton = document.getElementById("create-room");
const roomResult = document.getElementById("room-result");
const roomNameInput = document.getElementById("room-name");

createRoomButton.addEventListener("click", async () => {
    const roomName = roomNameInput.value;

    if (roomName.trim() === "") {
        roomResult.textContent = "Please enter a room name.";
        return;
    }

    const response = await fetch("/api/rooms", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            name: roomName
        })
    });

    const room = await response.json();

    roomResult.textContent = `Your room code is ${room.code}`;
});