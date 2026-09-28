
const themeToggleButton = document.getElementById("theme-toggle");

function applySavedTheme() {
    const savedTheme = localStorage.getItem("telviTheme");

    if (savedTheme === "dark") {
        document.body.classList.add("dark");
    } else {
        document.body.classList.remove("dark");
    }

    updateThemeButton();
}

function updateThemeButton() {
    if (!themeToggleButton) {
        return;
    }

    const isDarkMode = document.body.classList.contains("dark");

    themeToggleButton.textContent = isDarkMode ? "☀" : "☾";

    themeToggleButton.setAttribute(
        "aria-label",
        isDarkMode ? "Switch to light mode" : "Switch to dark mode"
    );
}

if (themeToggleButton) {
    applySavedTheme();

    themeToggleButton.addEventListener("click", () => {
        document.body.classList.toggle("dark");

        const isDarkMode = document.body.classList.contains("dark");

        localStorage.setItem(
            "telviTheme",
            isDarkMode ? "dark" : "light"
        );

        updateThemeButton();
    });
}

const createRoomButton = document.getElementById("create-room");
const roomNameInput = document.getElementById("room-name");
const roomResult = document.getElementById("room-result");

if (createRoomButton) {
    createRoomButton.addEventListener("click", async () => {
        const roomName = roomNameInput.value.trim();

        if (roomName === "") {
            roomResult.textContent = "Please enter a room name.";
            return;
        }

        createRoomButton.disabled = true;
        roomResult.textContent = "Creating room...";

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

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to create room.");
            }

            const room = {
                id: data.id,
                name: data.name,
                code: data.code,
                created_at: data.created_at
            };

            localStorage.setItem(
                "currentRoom",
                JSON.stringify(room)
            );

            window.location.href = "/room.html";

        } catch (error) {
            console.error("Create room error:", error);

            roomResult.textContent =
                error.message || "Failed to create room.";

            createRoomButton.disabled = false;
        }
    });
}

const joinRoomButton = document.getElementById("join-room");
const joinCodeInput = document.getElementById("join-code");
const joinResult = document.getElementById("join-result");

if (joinRoomButton) {
    joinRoomButton.addEventListener("click", async () => {
        const roomCode = joinCodeInput.value.trim().toUpperCase();

        if (roomCode.length !== 6) {
            joinResult.textContent =
                "Please enter a valid 6-character room code.";

            return;
        }

        joinRoomButton.disabled = true;
        joinResult.textContent = "Joining room...";

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

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Room not found.");
            }

            const room = {
                id: data.id,
                name: data.name,
                code: data.code,
                created_at: data.created_at
            };

            localStorage.setItem(
                "currentRoom",
                JSON.stringify(room)
            );

            window.location.href = "/room.html";

        } catch (error) {
            console.error("Join room error:", error);

            joinResult.textContent =
                error.message || "Failed to join room.";

            joinRoomButton.disabled = false;
        }
    });
}

if (joinCodeInput) {
    joinCodeInput.addEventListener("input", () => {
        joinCodeInput.value =
            joinCodeInput.value
                .toUpperCase()
                .replace(/[^A-Z0-9]/g, "")
                .slice(0, 6);
    });
}
