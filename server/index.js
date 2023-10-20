import express from "express";

const PORT = process.env.PORT ?? 3000;

const app = express();

app.get("/", (req, res) => {
    res.send("<h1>This is the Chat</h1>");
});

app.listen(PORT, () => {
    console.log(`Server running on port: ${PORT}`);
});