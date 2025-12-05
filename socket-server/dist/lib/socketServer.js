"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.socketServer = socketServer;
const SessionManager_1 = require("./SessionManager");
function socketServer(io) {
    io.on("connection", (socket) => {
        console.log("Client connected:", socket.id);
        socket.on("join_project", async ({ userId, projectId }) => {
            socket.join(projectId);
            await SessionManager_1.SessionManager.startSession(userId, projectId);
            io.to(projectId).emit("presence_update", {
                userId,
                status: "ONLINE",
            });
        });
        socket.on("activity", async ({ userId, projectId }) => {
            await SessionManager_1.SessionManager.resetIdle(userId, projectId);
            io.to(projectId).emit("presence_update", {
                userId,
                status: "ONLINE",
            });
        });
        socket.on("status_update", async ({ userId, projectId, status }) => {
            await SessionManager_1.SessionManager.setStatus(userId, projectId, status);
            io.to(projectId).emit("presence_update", {
                userId,
                status,
            });
        });
        socket.on("chat:send", ({ projectId, message }) => {
            io.to(projectId).emit("chat:new", message);
        });
        socket.on("disconnecting", async () => {
            const rooms = [...socket.rooms].filter((r) => r !== socket.id);
            for (const projectId of rooms) {
                const userId = projectId.split("-")[1]; // only if needed
                // End session when last socket leaves room
                await SessionManager_1.SessionManager.endSession(userId, projectId);
                io.to(projectId).emit("presence_update", {
                    userId,
                    status: "OFFLINE",
                });
            }
        });
    });
}
