import { createServer } from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";
import { socketServer } from "./lib/socketServer";

dotenv.config();

// Create HTTP server & properly handle requests
const httpServer = createServer((req, res) => {
  res.writeHead(200);
  res.end("Socket server is running");
});

// Socket.IO server with correct config
const io = new Server(httpServer, {
  cors: {
    origin: [
      "http://localhost:3000",        // local dev
      "https://teamfuse-mi5t.vercel.app/"   // production frontend
    ],
    methods: ["GET", "POST"],
    credentials: true,
  },
  path: "/socket.io", 
  transports: ["websocket"],
});

socketServer(io);

const PORT = process.env.PORT || 4000;
httpServer.listen(PORT, () => {
  console.log(`⚡ Socket server running on port ${PORT}`);
});
