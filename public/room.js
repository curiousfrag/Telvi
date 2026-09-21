
const savedRoom = localStorage.getItem("currentRoom");

if (!savedRoom) {
    window.location.href = "/";
} else {
    const room = JSON.parse(savedRoom);

    const roomTitle = document.getElementById("room-title");
    const roomCodeDisplay = document.getElementById("room-code-display");
    const sideRoomCode = document.getElementById("side-room-code");

    if (roomTitle) {
        roomTitle.textContent = room.name;
    }

    if (roomCodeDisplay) {
        roomCodeDisplay.textContent = `Room code: ${room.code}`;
    }

    if (sideRoomCode) {
        sideRoomCode.textContent = room.code;
    }

    const themeToggleButton = document.getElementById("theme-toggle");

    function updateThemeButton() {
        if (!themeToggleButton) {
            return;
        }

        const isDarkMode = document.body.classList.contains("dark");

        themeToggleButton.textContent = isDarkMode ? "☀" : "☾";

        themeToggleButton.setAttribute(
            "aria-label",
            isDarkMode
                ? "Switch to light mode"
                : "Switch to dark mode"
        );
    }

    const savedTheme = localStorage.getItem("telviTheme");

    if (savedTheme === "dark") {
        document.body.classList.add("dark");
    }

    updateThemeButton();

    if (themeToggleButton) {
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


    const copyCodeButton = document.getElementById("copy-code");

    if (copyCodeButton) {
        copyCodeButton.addEventListener("click", async () => {
            try {
                await navigator.clipboard.writeText(room.code);

                copyCodeButton.textContent = "Copied!";

                setTimeout(() => {
                    copyCodeButton.textContent = "Copy Room Code";
                }, 1500);

            } catch (error) {
                console.error("Could not copy room code:", error);
                copyCodeButton.textContent = "Copy failed";
            }
        });
    }


    const leaveRoomButton = document.getElementById("leave-room");

    if (leaveRoomButton) {
        leaveRoomButton.addEventListener("click", () => {
            localStorage.removeItem("currentRoom");
            window.location.href = "/";
        });
    }


    const messageInput = document.getElementById("message-input");
    const sendMessageButton = document.getElementById("send-message");
    const chatMessages = document.getElementById("chat-messages");

    function sendMessage() {
        if (!messageInput || !chatMessages) {
            return;
        }

        const messageText = messageInput.value.trim();

        if (messageText === "") {
            return;
        }

        const emptyChatMessage = document.querySelector(
            ".empty-chat-message"
        );

        if (emptyChatMessage) {
            emptyChatMessage.remove();
        }

        const messageWrapper = document.createElement("div");
        messageWrapper.classList.add("message-wrapper");

        const messageElement = document.createElement("p");
        messageElement.classList.add("chat-message");
        messageElement.textContent = messageText;

        const timestampElement = document.createElement("span");
        timestampElement.classList.add("message-time");

        timestampElement.textContent = new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit"
        });

        messageWrapper.appendChild(messageElement);
        messageWrapper.appendChild(timestampElement);

        chatMessages.appendChild(messageWrapper);

        chatMessages.scrollTop = chatMessages.scrollHeight;

        messageInput.value = "";
        messageInput.focus();
    }

    if (sendMessageButton) {
        sendMessageButton.addEventListener("click", sendMessage);
    }

    if (messageInput) {
        messageInput.addEventListener("keydown", (event) => {
            if (event.key === "Enter") {
                sendMessage();
            }
        });
    }
}