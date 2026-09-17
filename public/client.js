const createRoomButton = document.getElementById("create-room");
const roomResult = document.getElementById("room-result");
const roomNameInput = document.getElementById("room-name");

const joinRoomButton = document.getElementById("join-room");
const joinCodeInput = document.getElementById("join-code");
const joinResult = document.getElementById("join-result");

const themeToggle = document.getElementById("theme-toggle");


function updateThemeButton() {
    const darkModeEnabled = document.body.classList.contains("dark");

    themeToggle.textContent = darkModeEnabled ? "☀️" : "🌙";

    themeToggle.setAttribute(
        "aria-label",
        darkModeEnabled ? "Switch to light mode" : "Switch to dark mode"
    );
}


themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark");

    const darkModeEnabled = document.body.classList.contains("dark");

    localStorage.setItem("darkMode", darkModeEnabled);

    updateThemeButton();
});


const savedTheme = localStorage.getItem("darkMode");

if (savedTheme === "true") {
    document.body.classList.add("dark");
}

updateThemeButton();


createRoomButton.addEventListener("click", async () => {
    const roomName = roomNameInput.value.trim();

    if (roomName === "") {
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

        if (!response.ok) {
            roomResult.textContent =
                room.error || "Could not create room.";
            return;
        }

        roomResult.textContent = `Your room code is ${room.code}`;

        console.log("Room created:", room);
    } catch (error) {
        console.error("Create room error:", error);
        roomResult.textContent = "Could not connect to the server.";
    }
});


joinRoomButton.addEventListener("click", async () => {
    const roomCode = joinCodeInput.value.trim().toUpperCase();

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

        if (!response.ok) {
            joinResult.textContent =
                room.error || "Could not join room.";
            return;
        }

        joinResult.textContent = `Joined ${room.name}!`;

        console.log("Joined room:", room);
    } catch (error) {
        console.error("Join room error:", error);
        joinResult.textContent = "Could not connect to the server.";
    }
});