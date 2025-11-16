import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import http from "http";
import { Server } from "socket.io";
import connectDB from "./config/db.js";
import userRoutes from "./routes/userRoutes.js";
import staffRoutes from "./routes/staffRoutes.js";
import Query from "./models/Query.js";

dotenv.config();
connectDB();

const app = express();

// Middleware
app.use(cors({
    origin: "https://querynest-pi.vercel.app",
    credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

// Routes
app.use("/api/users", userRoutes);
app.use("/api/staff", staffRoutes);

app.get("/", (req, res) => {
    res.send("API is running");
});

// HTTP server & Socket.IO
const server = http.createServer(app);
export const io = new Server(server, {
    cors: { origin: "https://querynest-pi.vercel.app", methods: ["GET", "POST"] },
});

io.on("connection", (socket) => {
    console.log("New client connected:", socket.id);

    // Join a query room
    socket.on("joinRoom", (roomId) => {
        socket.join(roomId);
        console.log(`${socket.id} joined room ${roomId}`);
    });

    // Send message
    socket.on("sendMessage", async ({ roomId, sender, text, role, tag }) => {
        console.log("sendMessage received:", { roomId, sender, text, role, tag });
        const message = {
            sender,
            text,
            role,
            tag: tag || "General",
            time: new Date(),
        };

        // Broadcast to all clients in the room
        io.to(roomId).emit("receiveMessage", { roomId, message });

        // Save to DB
        try {
            const query = await Query.findById(roomId);
            if (query) {
                query.messages.push(message);
                if (role === "staff") query.status = "In-Progress";
                await query.save();
            }
        } catch (err) {
            console.error("Error saving message:", err);
        }
    });

    socket.on("disconnect", () => {
        console.log("Client disconnected:", socket.id);
    });
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
