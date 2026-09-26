const express = require("express");
const path = require("path");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;


const rooms = [];


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


app.post("/api/rooms", (req, res) => {
    const roomName = req.body.name;

    if (!roomName || roomName.trim() === "") {
        return res.status(400).json({
            error: "Room name is required"
        });
    }

    const room = {
        name: roomName.trim(),
        code: generateRoomCode()
    };

    rooms.push(room);

    res.status(201).json(room);
});

app.post("/api/rooms/join", (req, res) => {
    const roomCode = req.body.code;

    if (!roomCode || roomCode.trim() === "") {
        return res.status(400).json({
            error: "Room code is required"
        });
    }

    const normalizedCode = roomCode.trim().toUpperCase();

    const room = rooms.find(
        (room) => room.code === normalizedCode
    );

    if (!room) {
        return res.status(404).json({
            error: "Room not found"
        });
    }

    res.json(room);
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


server.listen(PORT, () => {
    console.log(`Telvi is running on http://localhost:${PORT}`);
});