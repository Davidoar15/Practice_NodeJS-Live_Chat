import express from "express";
import logger from "morgan";
import { Server } from "socket.io";
import { createServer } from "node:http";
import dotenv from "dotenv";
import { createClient } from "@libsql/client";

dotenv.config();

const PORT = process.env.PORT ?? 3000;

const app = express();
const server = createServer(app);
const io = new Server(server, {
    connectionStateRecovery: {}
});

const db = createClient({
    url: 'libsql://turso-url',
    authToken: process.env.DB_TOKEN
});

await db.execute(`
    CREATE TABLE IF NOT EXIST messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        content TEXT
    )
`)

io.on("connection", (socket) => {
    console.log("An User has Connected");

    socket.on("disconnect", () => {
        console.log("An User has Disconnected");
    });

    socket.on("chat message", async (msg) => {
        let result 

        try {
            result = await db.execute({
                sql: 'INSERT INTO messages (content) VALUES (:msg)',
                args: { msg }
                
            });
        } catch(error) {
            console.log(error);
            return
        };

        io.emit("chat message", msg, result.lastInsertRowid.toString());
    });
});

app.use(logger("dev"));

app.get("/", (req, res) => {
    res.sendFile(process.cwd()+'/client/index.html');
});

server.listen(PORT, () => {
    console.log(`Server running on port: ${PORT}`);
});