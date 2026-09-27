const savedRoom = localStorage.getItem("currentRoom");

if (!savedRoom) {
    window.location.href = "/";
} else {
    const room = JSON.parse(savedRoom);

    const roomTitle = document.getElementById("room-title");
    const roomCodeDisplay =
        document.getElementById("room-code-display");
    const sideRoomCode =
        document.getElementById("side-room-code");

    const themeToggleButton =
        document.getElementById("theme-toggle");
    const copyCodeButton =
        document.getElementById("copy-code");
    const leaveRoomButton =
        document.getElementById("leave-room");

    const messageInput =
        document.getElementById("message-input");
    const sendMessageButton =
        document.getElementById("send-message");
    const chatMessages =
        document.getElementById("chat-messages");

    const typingIndicator =
        document.getElementById("typing-indicator");


    // ==============================
    // USER IDENTITY
    // ==============================

    let clientId =
        localStorage.getItem("telviClientId");

    if (!clientId) {
        clientId =
            crypto.randomUUID();

        localStorage.setItem(
            "telviClientId",
            clientId
        );
    }


    // ==============================
    // ROOM INFORMATION
    // ==============================

    if (roomTitle) {
        roomTitle.textContent = room.name;
    }

    if (roomCodeDisplay) {
        roomCodeDisplay.textContent =
            Room code: ${room.code};
    }

    if (sideRoomCode) {
        sideRoomCode.textContent = room.code;
    }


    // ==============================
    // DARK MODE
    // ==============================

    function updateThemeButton() {
        if (!themeToggleButton) {
            return;
        }

        const isDarkMode =
            document.body.classList.contains("dark");

        themeToggleButton.textContent =
            isDarkMode ? "☀️" : "☾";

        themeToggleButton.setAttribute(
            "aria-label",
            isDarkMode
                ? "Switch to light mode"
                : "Switch to dark mode"
        );
    }


    const savedTheme =
        localStorage.getItem("telviTheme");

    if (savedTheme === "dark") {
        document.body.classList.add("dark");
    }

    updateThemeButton();


    if (themeToggleButton) {
        themeToggleButton.addEventListener(
            "click",
            () => {
                document.body.classList.toggle("dark");

                const isDarkMode =
                    document.body.classList.contains("dark");

                localStorage.setItem(
                    "telviTheme",
                    isDarkMode
                        ? "dark"
                        : "light"
                );

                updateThemeButton();
            }
        );
    }


    // ==============================
    // COPY ROOM CODE
    // ==============================

    if (copyCodeButton) {
        copyCodeButton.addEventListener(
            "click",
            async () => {
                try {
                    await navigator.clipboard.writeText(
                        room.code
                    );

                    copyCodeButton.textContent =
                        "Copied!";

                    setTimeout(() => {
                        copyCodeButton.textContent =
                            "Copy Room Code";
                    }, 1500);

                } catch (error) {
                    console.error(
                        "Could not copy room code:",
                        error
                    );

                    copyCodeButton.textContent =
                        "Copy failed";
                }
            }
        );
    }


    // ==============================
    // LEAVE ROOM
    // ==============================

    if (leaveRoomButton) {
        leaveRoomButton.addEventListener(
            "click",
            () => {
                localStorage.removeItem(
                    "currentRoom"
                );

                window.location.href = "/";
            }
        );
    }


    // ==============================
    // SOCKET.IO
    // ==============================

    const socket = io({
        transports: ["websocket"]
    });


    socket.on("connect", () => {
        console.log(
            "Connected to Socket.IO:",
            socket.id
        );

        socket.emit(
            "join-room",
            room.code
        );
    });


    // ==============================
    // EMPTY CHAT
    // ==============================

    function removeEmptyMessage() {
        const emptyMessage =
            document.querySelector(
                ".empty-chat-message"
            );

        if (emptyMessage) {
            emptyMessage.remove();
        }
    }


    // ==============================
    // FORMAT TIME
    // ==============================

    function formatMessageTime(time) {
        return new Date(time).toLocaleTimeString(
            [],
            {
                hour: "2-digit",
                minute: "2-digit"
            }
        );
    }


    // ==============================
    // DISPLAY MESSAGE
    // ==============================

    function displayMessage(message) {
        if (!chatMessages) {
            return;
        }

        removeEmptyMessage();

        const isOwnMessage =
            message.senderId === clientId;

        const messageWrapper =
            document.createElement("div");

        messageWrapper.classList.add(
            "message-wrapper"
        );

        if (isOwnMessage) {
            messageWrapper.classList.add(
                "own-message"
            );
        } else {
            messageWrapper.classList.add(
                "other-message"
            );
        }


        const messageElement =
            document.createElement("p");

        messageElement.classList.add(
            "chat-message"
        );

        messageElement.textContent =
            message.text;


        const timestampElement =
            document.createElement("span");

        timestampElement.classList.add(
            "message-time"
        );

        timestampElement.textContent =
            formatMessageTime(
                message.time
            );


        messageWrapper.appendChild(
            messageElement
        );

        messageWrapper.appendChild(
            timestampElement
        );

        chatMessages.appendChild(
            messageWrapper
        );


        chatMessages.scrollTop =
            chatMessages.scrollHeight;
    }


    // ==============================
    // MESSAGE HISTORY
    // ==============================

    socket.on(
        "message-history",
        (messages) => {
            if (!Array.isArray(messages)) {
                return;
            }

            if (messages.length === 0) {
                return;
            }

            messages.forEach((message) => {
                displayMessage(message);
            });
        }
    );


    // ==============================
    // RECEIVE MESSAGE
    // ==============================

    socket.on(
        "receive-message",
        (message) => {
            displayMessage(message);
        }
    );


    // ==============================
    // SEND MESSAGE
    // ==============================

    function sendMessage() {
        if (!messageInput) {
            return;
        }

        const messageText =
            messageInput.value.trim();

        if (messageText === "") {
            return;
        }

        socket.emit(
            "send-message",
            {
                text: messageText,
                clientId: clientId
            }
        );

        messageInput.value = "";

        socket.emit(
            "typing",
            {
                isTyping: false
            }
        );

        messageInput.focus();
    }


    if (sendMessageButton) {
        sendMessageButton.addEventListener(
            "click",
            sendMessage
        );
    }


    // ==============================
    // ENTER TO SEND
    // SHIFT + ENTER = NEW LINE
    // ==============================

    if (messageInput) {
        messageInput.addEventListener(
            "keydown",
            (event) => {
                if (
                    event.key === "Enter" &&
                    !event.shiftKey
                ) {
                    event.preventDefault();
                    sendMessage();
                }
            }
        );
    }


    // ==============================
    // TYPING INDICATOR
    // ==============================

    let typingTimeout;

    if (messageInput) {
        messageInput.addEventListener(
            "input",
            () => {
                socket.emit(
                    "typing",
                    {
                        isTyping:
                            messageInput.value.trim() !== ""
                    }
                );

                clearTimeout(typingTimeout);

                typingTimeout = setTimeout(() => {
                    socket.emit(
                        "typing",
                        {
                            isTyping: false
                        }
                    );
                }, 1200);
            }
        );
    }


    socket.on(
        "user-typing",
        (data) => {
            if (!typingIndicator) {
                return;
            }

            if (data.isTyping) {
                typingIndicator.textContent =
                    "Someone is typing...";
            } else {
                typingIndicator.textContent = "";
            }
        }
    );


    // ==============================
    // CONNECTION ERRORS
    // ==============================

    socket.on(
        "connect_error",
        (error) => {
            console.error(
                "Socket.IO connection error:",
                error
            );
        }
    );
}