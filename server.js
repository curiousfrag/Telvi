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


    // ==============================
    // JOIN ROOM
    // ==============================

    socket.on("join-room", async (roomCode) => {
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


        // Load previous messages from Neon
        try {
            const result = await pool.query(
                `SELECT
                    messages.id,
                    messages.content,
                    messages.sender_id,
                    messages.created_at
                 FROM messages
                 JOIN rooms
                    ON messages.room_id = rooms.id
                 WHERE rooms.code = $1
                 ORDER BY messages.created_at ASC`,
                [normalizedCode]
            );

            socket.emit(
                "message-history",
                result.rows.map((message) => ({
                    id: message.id,
                    text: message.content,
                    senderId: message.sender_id,
                    time: message.created_at
                }))
            );

        } catch (error) {
            console.error(
                "Error loading message history:",
                error
            );
        }
    });


    // ==============================
    // SEND MESSAGE
    // ==============================

    socket.on("send-message", async (messageData) => {
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

        const cleanMessage = messageText
            .trim()
            .slice(0, 500);


        try {
            // Find the database ID of the room
            const roomResult = await pool.query(
                `SELECT id
                 FROM rooms
                 WHERE code = $1`,
                [roomCode]
            );

            if (roomResult.rows.length === 0) {
                return;
            }

            const roomId = roomResult.rows[0].id;


            // Save message to Neon
            const messageResult = await pool.query(
                `INSERT INTO messages
                    (room_id, sender_id, content)
                 VALUES ($1, $2, $3)
                 RETURNING id, sender_id, content, created_at`,
                [
                    roomId,
                    socket.id,
                    cleanMessage
                ]
            );


            const savedMessage = messageResult.rows[0];


            // Broadcast the saved message
            io.to(roomCode).emit(
                "receive-message",
                {
                    id: savedMessage.id,
                    text: savedMessage.content,
                    time: savedMessage.created_at,
                    senderId: savedMessage.sender_id
                }
            );

        } catch (error) {
            console.error(
                "Error saving message:",
                error
            );
        }
    });


    // ==============================
    // DISCONNECT
    // ==============================

    socket.on("disconnect", () => {
        console.log(
            "A user disconnected:",
            socket.id
        );
    });
});


// Test Neon connection
pool.query("SELECT NOW()")
    .then(() => {
        console.log(
            "Connected to Neon PostgreSQL"
        );
    })
    .catch((error) => {
        console.error(
            "Neon PostgreSQL connection failed:",
            error
        );
    });


server.listen(PORT, () => {
    console.log(
        `Telvi is running on http://localhost:${PORT}`
    );
});