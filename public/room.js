const savedRoom = localStorage.getItem("currentRoom");
if (!savedRoom) {
    window.location.href = "/";
}
const room = JSON.parse(savedRoom);
const roomTite = document.getElementById("room-title");
const roomCodeDispay = document.getElementById("room-code-display");
const sideRoomCode = document.getElementById("side-room-code");

roomTitle.textContent = room.name;
roomCodeDisplay.textContent = `Room code: ${room.code}`;
sideRoomCode.textContent = room.code;


