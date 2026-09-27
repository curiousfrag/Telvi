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
