const express = require("express");
const path = require("path");

const app = express();
const PORT = 3000;

// Temporary storage for rooms.
// This will eventually be replaced with PostgreSQL.
const rooms = [];

// Generate a random 6-character room code
function generateRoomCode() {
    return Math.random()
        .toString(36)
        .substring(2, 8)
        .toUpperCase();
}

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Serve the homepage
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Create a study room
app.post("/api/rooms", (req, res) => {
    const roomName = req.body.name;

    // Make sure a room name was provided
    if (!roomName || roomName.trim() === "") {
        return res.status(400).json({
            error: "Room name is required"
        });
    }

    const roomCode = generateRoomCode();

    const room = {
        code: roomCode,
        name: roomName.trim()
    };

    rooms.push(room);

    res.status(201).json(room);
});

// Join an existing study room
app.post("/api/rooms/join", (req, res) => {
    const roomCode = req.body.code;

    if (!roomCode || roomCode.trim() === "") {
        return res.status(400).json({
            error: "Room code is required"
        });
    }

    const normalizedCode = roomCode.trim().toUpperCase();

    const room = rooms.find((room) => room.code === normalizedCode);

    if (!room) {
        return res.status(404).json({
            error: "Room not found"
        });
    }

    res.json(room);
});

// Export the Express app
module.exports = app;

// Start the local development server
app.listen(PORT, () => {
    console.log(`Telvi is running on http://localhost:${PORT}`);
});