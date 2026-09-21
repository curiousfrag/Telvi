
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

function generateRoomCode() {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code = "";

    for (let i = 0; i < 6; i++) {
        const randomIndex = Math.floor(
            Math.random() * characters.length
        );

        code += characters[randomIndex];
    }

    return code;
}

if (createRoomButton) {
    createRoomButton.addEventListener("click", () => {
        const roomName = roomNameInput.value.trim();

        if (roomName === "") {
            roomResult.textContent = "Please enter a room name.";
            return;
        }

        const room = {
            name: roomName,
            code: generateRoomCode()
        };

        localStorage.setItem("currentRoom", JSON.stringify(room));

        window.location.href = "/room.html";
    });
}

const joinRoomButton = document.getElementById("join-room");
const joinCodeInput = document.getElementById("join-code");
const joinResult = document.getElementById("join-result");

if (joinRoomButton) {
    joinRoomButton.addEventListener("click", () => {
        const roomCode = joinCodeInput.value.trim().toUpperCase();

        if (roomCode.length !== 6) {
            joinResult.textContent =
                "Please enter a valid 6-character room code.";

            return;
        }

        const room = {
            name: "Joined Study Room",
            code: roomCode
        };

        localStorage.setItem("currentRoom", JSON.stringify(room));

        window.location.href = "/room.html";
    });
}
if (joinCodeInput) {
    joinCodeInput.addEventListener("input", () => {
        joinCodeInput.value = joinCodeInput.value.toUpperCase();
    });
}