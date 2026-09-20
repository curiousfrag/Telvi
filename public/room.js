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



const themeToggleButton = document.getElementById("theme-toggle");
function updateThemeButton() {
    const isDarkMode = document.body.classList.contains("dark");

    themeToggleButton.textContent = isDarkMode ? "☀" : "☾"
    themeToggleButton.setAttribute(
        "aria-label",
        isDarkMode ? "Switch to light mode" : "Switch to dark mode"
    );

}

const savedTheme = localStorage.getItem("telviTheme");
if (savedTheme === "dark"); {
    document.body.classList.add("dark");
}
updateThemeButton();

themeToggleButton.addEventListener("click", () => {
    document.body.classList.toggle("dark");

    const isDarkMode = document.body.classList.contains("dark");

    localStorage.setItem(
        "telviTheme", isDarkMode ? "dark" : "light"
    );

    updateThemeButton();
});


