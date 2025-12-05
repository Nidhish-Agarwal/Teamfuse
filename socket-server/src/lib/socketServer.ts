import { Server, Socket } from "socket.io";
import { SessionManager } from "./SessionManager";

export function socketServer(io: Server) {
  io.on("connection", (socket: Socket) => {
    console.log("Client connected:", socket.id);

    socket.on("join_project", async ({ userId, projectId }) => {
      socket.join(projectId);
      await SessionManager.startSession(userId, projectId);

      io.to(projectId).emit("presence_update", {
        userId,
        status: "ONLINE",
      });
    });

    socket.on("activity", async ({ userId, projectId }) => {
      await SessionManager.resetIdle(userId, projectId);

      io.to(projectId).emit("presence_update", {
        userId,
        status: "ONLINE",
      });
    });

    socket.on("status_update", async ({ userId, projectId, status }) => {
      await SessionManager.setStatus(userId, projectId, status);

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
        await SessionManager.endSession(userId, projectId);

        io.to(projectId).emit("presence_update", {
          userId,
          status: "OFFLINE",
        });
      }
    });
  });
}
