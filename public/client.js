const createRoomButton = document.getElementById("create-room");
const roomResult = document.getElementById("room-result");
const roomNameInput = document.getElementById("room-name");

const joinRoomButton = document.getElementById("join-room");
const joinCodeInput = document.getElementById("join-code");
const joinResult = document.getElementById("join-result");


// ============================
// CREATE ROOM
// ============================

createRoomButton.addEventListener("click", async () => {
    const roomName = roomNameInput.value;

    // Check that the user entered a room name
    if (roomName.trim() === "") {
        roomResult.textContent = "Please enter a room name.";
        return;
    }

    try {
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

        // Handle server errors
        if (!response.ok) {
            roomResult.textContent = room.error || "Could not create room.";
            return;
        }

        roomResult.textContent = `Your room code is ${room.code}`;

        console.log("Room created:", room);

    } catch (error) {
        console.error("Create room error:", error);
        roomResult.textContent = "Could not connect to the server.";
    }
});


// ============================
// JOIN ROOM
// ============================

joinRoomButton.addEventListener("click", async () => {
    const roomCode = joinCodeInput.value.trim().toUpperCase();

    // Check that the user entered a room code
    if (roomCode === "") {
        joinResult.textContent = "Please enter a room code.";
        return;
    }

    try {
        const response = await fetch("/api/rooms/join", {
            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                code: roomCode
            })
        });

        const room = await response.json();

        // Handle server errors
        if (!response.ok) {
            joinResult.textContent = room.error || "Could not join room.";
            return;
        }

        joinResult.textContent = `Joined ${room.name}!`;

        console.log("Joined room:", room);

    } catch (error) {
        console.error("Join room error:", error);
        joinResult.textContent = "Could not connect to the server.";
    }
});