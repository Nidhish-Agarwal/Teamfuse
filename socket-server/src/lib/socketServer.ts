import { Server, Socket } from "socket.io";
import prisma from "./prisma";

export function socketServer(io: Server) {
  const userSockets = new Map<string, Set<string>>();
  const socketProjects = new Map<string, string>();

  io.on("connection", (socket: Socket) => {
    socket.on("join_chat", ({ projectId }) => {
      socket.join(projectId);
    });

    socket.on("chat:send", ({ projectId, message }) => {
      io.to(projectId).emit("chat:new", message);
    });

    socket.on("activity", async ({ userId, projectId }) => {
      io.to(projectId).emit("presence_update", {
        userId,
        projectId,
        status: "ONLINE",
      });
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected");
    });
  });
}
