const roomTitle = document.getElementById("room-title");
const roomCodeDisplay = document.getElementById("room-code-display");

const copyCodeButton = document.getElementById("copy-code");
const leaveRoombutton = document.getElementById("leave-room");

const messageInput = document.getElementById("message-input");
const sendMessageButton = document.getElementById("send-message");
const chatMessageButton = document.getElementById("chat-messages");

const savedRoom = localStorage.getItem("currentRoom"); 

if (!savedRoom) {
    window.location.href = "/";
} else {
    const room = JSON.parse(savedRoom);

    roomTitle.textContent = room.name;
    roomCodeDisplay.textContent = `room.code: ${room.code}`;
}

copyCodeButton.addEventListener("click", async () => {
    const room = JSON.parse(localStorage.getItem("currentRoom"));

    try {
        await navigator.clipboard.writeText(room.code);
        copyCodeButton.textContent = "Copied!";

        setTimeout(() => {
            copyCodeButton.textContent = "Copy Room Code";
        }, 1500);
    } catch (error) {
        console.error("Failed to copy room code:", error);
    }
});

leaveRoomButton.addEventListener("click", () => {
    localstorage.removeItem("currentRoom");
    window.location.href = "/";
});

function sendMessage() {
    const messageText = messageInput.value.trim();

    if (messageText === "") {
        return;
    } 

    const emptyChatMessage = document.querySelector(".empty-chat-message");

    if (emptyChatMessage) {
        emptyChatMessage.remove();
    }

    const messageElement = document.createElement("p");
    messageElement.classList.add("chat-message");
    messageElement.textContent = messageText;

    chatMessageButton.appendChild(messageElement);

    messageInput.value = "";
    messageInput.focus();
}

sendMessageButton.addEventListener("click", sendMessage);

messageInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        sendMessage();
    }
});