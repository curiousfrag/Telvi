const dotenv = require("dotenv");

dotenv.config({
    path: ".env.local"
});

const express = require("express");
const path = require("path");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const { Pool } = require("pg");

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

const PORT = process.env.PORT || 3000;


function generateRoomCode() {
    return Math.random()
        .toString(36)
        .substring(2, 8)
        .toUpperCase();
}


app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));


app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});


app.get("/room", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "room.html"));
});


app.post("/api/rooms", async (req, res) => {
    const roomName = req.body.name;

    if (!roomName || roomName.trim() === "") {
        return res.status(400).json({
            error: "Room name is required"
        });
    }

    const roomCode = generateRoomCode();

    try {
        const result = await pool.query(
            `INSERT INTO rooms (name, code)
             VALUES ($1, $2)
             RETURNING id, name, code, created_at`,
            [roomName.trim(), roomCode]
        );

        res.status(201).json(result.rows[0]);

    } catch (error) {
        console.error("Error creating room:", error);

        res.status(500).json({
            error: "Failed to create room"
        });
    }
});

app.post("/api/rooms/join", async (req, res) => {
    const roomCode = req.body.code;

    if (!roomCode || roomCode.trim() === "") {
        return res.status(400).json({
            error: "Room code is required"
        });
    }

    const normalizedCode = roomCode.trim().toUpperCase();

    try {
        const result = await pool.query(
            `SELECT id, name, code, created_at
             FROM rooms
             WHERE code = $1`,
            [normalizedCode]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                error: "Room not found"
            });
        }

        res.json(result.rows[0]);

    } catch (error) {
        console.error("Error joining room:", error);

        res.status(500).json({
            error: "Failed to find room"
        });
    }
});


io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);

    
    socket.on("join-room", (roomCode) => {
        if (typeof roomCode !== "string") {
            return;
        }

        const normalizedCode = roomCode.trim().toUpperCase();

        if (normalizedCode.length !== 6) {
            return;
        }

        socket.join(normalizedCode);
        socket.data.roomCode = normalizedCode;

        console.log(
            `${socket.id} joined room ${normalizedCode}`
        );
    });

    
    socket.on("send-message", (messageData) => {
        if (!messageData || typeof messageData !== "object") {
            return;
        }

        const roomCode = socket.data.roomCode;
        const messageText = messageData.text;

        if (
            !roomCode ||
            typeof messageText !== "string" ||
            messageText.trim() === ""
        ) {
            return;
        }

        const message = {
            text: messageText.trim().slice(0, 500),
            time: new Date().toISOString(),
            senderId: socket.id
        };

        io.to(roomCode).emit("receive-message", message);
    });

    socket.on("disconnect", () => {
        console.log("A user disconnected:", socket.id);
    });
});

pool.query("SELECT NOW()")
    .then(() => {
        console.log("Connected to Neon PostgreSQL");
    })
    .catch((error) => {
        console.error("Neon PostgreSQL connection failed:", error);
    });


server.listen(PORT, () => {
    console.log(`Telvi is running on http://localhost:${PORT}`);
});