
const savedRoom = localStorage.getItem("currentRoom");

if (!savedRoom) {
    window.location.href = "/";
} else {
    const room = JSON.parse(savedRoom);

    const roomTitle = document.getElementById("room-title");
    const roomCodeDisplay = document.getElementById("room-code-display");
    const sideRoomCode = document.getElementById("side-room-code");

    const themeToggleButton = document.getElementById("theme-toggle");
    const copyCodeButton = document.getElementById("copy-code");
    const leaveRoomButton = document.getElementById("leave-room");

    const messageInput = document.getElementById("message-input");
    const sendMessageButton = document.getElementById("send-message");
    const chatMessages = document.getElementById("chat-messages");

    
    if (roomTitle) {
        roomTitle.textContent = room.name;
    }

    if (roomCodeDisplay) {
        roomCodeDisplay.textContent = `Room code: ${room.code}`;
    }

    if (sideRoomCode) {
        sideRoomCode.textContent = room.code;
    }

    
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

            const isDarkMode =
                document.body.classList.contains("dark");

            localStorage.setItem(
                "telviTheme",
                isDarkMode ? "dark" : "light"
            );

            updateThemeButton();
        });
    }

    
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

    
    if (leaveRoomButton) {
        leaveRoomButton.addEventListener("click", () => {
            localStorage.removeItem("currentRoom");
            window.location.href = "/";
        });
    }

    
    const socket = io();

    console.log("Socket created:", socket);

    socket.on("connect", () => {
        console.log("Connected to Socket.IO:", socket.id);

        
        socket.emit("join-room", room.code);
    });

    
    function removeEmptyMessage() {
        const emptyMessage = document.querySelector(
            ".empty-chat-message"
        );

        if (emptyMessage) {
            emptyMessage.remove();
        }
    }


    function displayMessage(message) {
        if (!chatMessages) {
            return;
        }

        removeEmptyMessage();

        const messageWrapper = document.createElement("div");
        messageWrapper.classList.add("message-wrapper");

        const messageElement = document.createElement("p");
        messageElement.classList.add("chat-message");
        messageElement.textContent = message.text;

        const timestampElement = document.createElement("span");
        timestampElement.classList.add("message-time");

        timestampElement.textContent = new Date(
            message.time
        ).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit"
        });

        messageWrapper.appendChild(messageElement);
        messageWrapper.appendChild(timestampElement);

        chatMessages.appendChild(messageWrapper);

        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    
    socket.on("receive-message", (message) => {
        displayMessage(message);
    });

    
    function sendMessage() {
        if (!messageInput) {
            return;
        }

        const messageText = messageInput.value.trim();

        if (messageText === "") {
            return;
        }

        socket.emit("send-message", {
            text: messageText
        });

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

    socket.on("connect_error", (error) => {
        console.error("Socket.IO connection error:", error);
    });
}