const express = require("express");
const app = express();
const PORT = 3000;

const rooms = [];

function generateRoomCode() {
   return Math.random().toString(36).substring(2, 8).toUpperCase();
}

app.use(express.json());
app.use(express.static("public"));

app.post("/api/rooms", (req, res) => {
   const roomName = req.body.name;

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

 app.listen(PORT,() => {
    console.log(`Telvi is running on http://localhost:${PORT}`);
 });