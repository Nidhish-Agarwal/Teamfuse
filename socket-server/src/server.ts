import { createServer } from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";
import { socketServer } from "./lib/socketServer";

dotenv.config();

const httpServer = createServer();

const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
  path: "/socket",
});

socketServer(io);

const PORT = process.env.PORT || 4000;
httpServer.listen(PORT, () => {
  console.log(`⚡ Socket server running on port ${PORT}`);
});
