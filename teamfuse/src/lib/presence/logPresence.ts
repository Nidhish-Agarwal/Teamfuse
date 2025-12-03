import { prisma } from "@/lib/prisma";

// const FRESH_SESSION_MS = 2 * 60 * 1000; // 2 minutes
const SESSION_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes

export async function logStartSession(userId: string, projectId: string) {
  try {
    const openSessions = await prisma.presenceLog.findMany({
      where: { userId, projectId, sessionEnd: null },
    });

    const now = new Date();

    // Handle existing sessions
    for (const session of openSessions) {
      const sessionAge = now.getTime() - session.sessionStart.getTime();

      if (sessionAge > SESSION_TIMEOUT_MS) {
        // Close timed-out sessions
        const minutes = Math.max(1, Math.floor(sessionAge / 60000));

        await prisma.presenceLog.update({
          where: { id: session.id },
          data: {
            sessionEnd: now,
            duration: minutes,
            status: "OFFLINE",
          },
        });
      } else {
        // Reuse recent session
        return session;
      }
    }

    // No active session → create new one
    return await prisma.presenceLog.create({
      data: {
        userId,
        projectId,
        status: "ONLINE",
        sessionStart: now,
      },
    });
  } catch (error) {
    console.error("logStartSession error:", error);
    return null;
  }
}

export async function updateStatus(
  userId: string,
  projectId: string,
  status: "ONLINE" | "OFFLINE" | "IDLE"
) {
  try {
    return await prisma.presenceLog.updateMany({
      where: { userId, projectId, sessionEnd: null },
      data: { status },
    });
  } catch (err) {
    console.error("updateStatus error:", err);
  }
}

export async function logEndSession(userId: string, projectId: string) {
  try {
    const open = await prisma.presenceLog.findMany({
      where: { userId, projectId, sessionEnd: null },
    });

    for (const session of open) {
      const now = new Date();
      const minutes = Math.max(
        1,
        Math.floor((now.getTime() - session.sessionStart.getTime()) / 60000)
      );

      await prisma.presenceLog.update({
        where: { id: session.id },
        data: {
          sessionEnd: now,
          duration: minutes,
          status: "OFFLINE",
        },
      });
    }
  } catch (err) {
    console.error("logEndSession error:", err);
  }
}
