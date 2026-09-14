const express = require("express");
const app = express();
const PORT = 3000;

app.use(express.static("public"));

app.get("/", (req, res) => {
    res.send("IT WORKS!");
});

 app.listen(PORT,() => {
    console.log(`Telvi is running on http://localhost:${PORT}`);
 });
