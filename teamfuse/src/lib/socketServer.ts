import { Server, Socket } from "socket.io";
import {
  logStartSession,
  logEndSession,
  updateStatus,
} from "./presence/logPresence";
import { prisma } from "@/lib/prisma";

interface JoinPayload {
  projectId: string;
  userId: string;
}

export function socketServer(io: Server) {
  io.on("connection", (socket: Socket) => {
    let currentProjectId: string | null = null;
    let currentUserId: string | null = null; // Session ID (GitHub OAuth ID)
    let currentDbUserId: string | null = null; // Database UUID

    let lastDbWrite = 0;
    const INTERVAL = 30_000;

    async function throttledWrite(status: string) {
      if (status === "IDLE" || status === "FOCUSED") return;

      const now = Date.now();
      if (now - lastDbWrite < INTERVAL) return;

      lastDbWrite = now;

      if (currentDbUserId && currentProjectId) {
        await updateStatus(currentDbUserId, currentProjectId, status);
      }
    }

    async function endSession() {
      if (!currentDbUserId || !currentProjectId) return;

      await updateStatus(currentDbUserId, currentProjectId, "OFFLINE");
      await logEndSession(currentDbUserId, currentProjectId);

      // Emit to both user IDs for compatibility
      io.to(currentProjectId).emit("presence_update", {
        userId: currentDbUserId, // Database ID
        originalUserId: currentUserId, // Session ID
        projectId: currentProjectId,
        status: "OFFLINE",
      });
    }

    socket.on("join_project", async ({ projectId, userId }: JoinPayload) => {
      currentProjectId = projectId;
      currentUserId = userId;

      socket.join(projectId);

      try {
        // Find the actual database user using GitHub OAuth ID
        const dbUser = await prisma.user.findFirst({
          where: {
            oauthId: userId, // Look for GitHub OAuth ID
          },
        });

        if (!dbUser) {
          console.log(`User with oauthId ${userId} not found in database`);
          // Still allow realtime presence but don't save to database
          io.to(projectId).emit("presence_update", {
            userId: userId, // Use session ID for realtime
            projectId,
            status: "ONLINE",
          });
          return;
        }

        // Store the actual database user ID
        currentDbUserId = dbUser.id;

        await logStartSession(currentDbUserId, projectId);
        await updateStatus(currentDbUserId, projectId, "ONLINE");

        // Emit with both IDs for compatibility
        io.to(projectId).emit("presence_update", {
          userId: currentDbUserId, // Database ID for API consistency
          originalUserId: userId, // Session ID for realtime matching
          projectId,
          status: "ONLINE",
        });
      } catch (error) {
        console.error("Error joining project:", error);
        // Fallback: use session ID for realtime presence
        io.to(projectId).emit("presence_update", {
          userId,
          projectId,
          status: "ONLINE",
        });
      }
    });

    socket.on("status_update", async ({ projectId, userId, status }) => {
      // Emit to both possible user IDs for compatibility
      io.to(projectId).emit("presence_update", {
        userId,
        originalUserId: userId,
        projectId,
        status,
      });

      throttledWrite(status);
    });

    socket.on("leave_project", endSession);
    socket.on("disconnect", endSession);
  });
}
