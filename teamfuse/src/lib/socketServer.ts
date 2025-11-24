/* eslint-disable @typescript-eslint/no-explicit-any */
import { Server, Socket } from "socket.io";
import { logStartSession, updateStatus } from "./presence/logPresence";

interface JoinPayload {
  projectId: string;
  userId: string;
}

const activeConnections = new Map<string, string>();

export function socketServer(io: Server) {
  io.on("connection", (socket: Socket) => {
    let currentUserId: string | null = null;
    let currentProjectId: string | null = null;

    socket.on("join_project", async ({ projectId, userId }: JoinPayload) => {
      // Save state
      currentUserId = userId;
      currentProjectId = projectId;

      // Disconnect old socket if duplicated
      const oldSocketId = activeConnections.get(userId);

      if (oldSocketId && oldSocketId !== socket.id) {
        const oldSocket = io.sockets.sockets.get(oldSocketId);
        if (oldSocket) {
          (oldSocket as any)._skipEnd = true;
          oldSocket.disconnect(true);
        }
      }

      activeConnections.set(userId, socket.id);
      socket.join(projectId);

      // Log or create session
      const session = await logStartSession(userId, projectId);

      if (session) {
        await updateStatus(userId, projectId, "ONLINE");

        io.to(projectId).emit("presence_update", {
          userId,
          projectId,
          status: "ONLINE",
        });
      }
    });

    socket.on("status_update", async ({ userId, projectId, status }) => {
      // Ignore foreign socket updates
      if (activeConnections.get(userId) !== socket.id) return;

      await updateStatus(userId, projectId, status);

      io.to(projectId).emit("presence_update", {
        userId,
        projectId,
        status,
      });
    });

    socket.on("disconnect", () => {
      // Skip disconnects from duplicate replacement
      if ((socket as any)._skipEnd) return;

      if (currentUserId && currentProjectId) {
        activeConnections.delete(currentUserId);

        io.to(currentProjectId).emit("presence_update", {
          userId: currentUserId,
          projectId: currentProjectId,
          status: "OFFLINE",
        });
      }
    });
  });
}
