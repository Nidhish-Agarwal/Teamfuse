"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const dotenv_1 = __importDefault(require("dotenv"));
const socketServer_1 = require("./lib/socketServer");
dotenv_1.default.config();
const httpServer = (0, http_1.createServer)();
const io = new socket_io_1.Server(httpServer, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
    },
    path: "/socket",
});
(0, socketServer_1.socketServer)(io);
const PORT = process.env.PORT || 4000;
httpServer.listen(PORT, () => {
    console.log(`⚡ Socket server running on port ${PORT}`);
});
