// src/lib/presence/logPresence.ts
import { prisma } from "@/lib/prisma";
import type { PresenceLog } from "@/generated/prisma";
import { Prisma } from "@prisma/client";

const SESSION_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes

/**
 * Start or reuse a presence session for a user in a project.
 * - If there's a recent open session (you started it less than SESSION_TIMEOUT_MS ago) we reuse it.
 * - Any stale open sessions older than SESSION_TIMEOUT_MS will be closed (sessionEnd, duration, OFFLINE).
 * - Otherwise a new session is created.
 *
 * Returns the active PresenceLog (existing or newly created), or null on error.
 */
export async function logStartSession(
  userId: string,
  projectId: string
): Promise<PresenceLog | null> {
  try {
    const now = new Date();

    // fetch all open sessions for this user/project (usually small)
    const openSessions = await prisma.presenceLog.findMany({
      where: { userId, projectId, sessionEnd: null },
    });

    if (!openSessions || openSessions.length === 0) {
      // no open session → create one
      const created = await prisma.presenceLog.create({
        data: {
          userId,
          projectId,
          status: "ONLINE",
          sessionStart: now,
        },
      });
      return created;
    }

    // Partition into timed-out and recent sessions
    const timedOut: PresenceLog[] = [];
    const recent: PresenceLog[] = [];

    for (const s of openSessions) {
      const sessionAge = now.getTime() - s.sessionStart.getTime();
      if (sessionAge > SESSION_TIMEOUT_MS) {
        timedOut.push(s);
      } else {
        recent.push(s);
      }
    }

    // Close timed-out sessions (one-by-one so we can calculate duration)
    if (timedOut.length > 0) {
      // perform updates sequentially (timedOut length usually small)
      for (const s of timedOut) {
        const minutes = Math.max(
          1,
          Math.floor((now.getTime() - s.sessionStart.getTime()) / 60000)
        );
        // update record to mark sessionEnd and duration
        // we ignore the returned value

        await prisma.presenceLog.update({
          where: { id: s.id },
          data: {
            sessionEnd: now,
            duration: minutes,
            status: "OFFLINE",
          },
        });
      }
    }

    // If a recent session exists, reuse it — but ensure its status is ONLINE
    if (recent.length > 0) {
      const sessionToReuse = recent[0];
      // If it's already ONLINE, just return it.
      // If not, update status to ONLINE (avoid unnecessary write if already ONLINE).
      if (sessionToReuse.status !== "ONLINE") {
        await prisma.presenceLog.update({
          where: { id: sessionToReuse.id },
          data: { status: "ONLINE" },
        });
        // Return the freshly-updated record
        return await prisma.presenceLog.findUnique({
          where: { id: sessionToReuse.id },
        });
      }
      return sessionToReuse;
    }

    // No recent sessions left (all were timed out and closed) → create a new one
    const created = await prisma.presenceLog.create({
      data: {
        userId,
        projectId,
        status: "ONLINE",
        sessionStart: now,
      },
    });

    return created;
  } catch (error) {
    // log error for debugging — do not throw to ensure presence system doesn't crash callers

    console.error("logStartSession error:", error);
    return null;
  }
}

/**
 * Update status (ONLINE | OFFLINE | IDLE) for all currently-open sessions for user/project.
 * Returns Prisma.BatchPayload so caller can inspect count of updated rows.
 */
// import prisma at top as you already do
export async function updateStatus(
  userId: string,
  projectId: string,
  status: "ONLINE" | "OFFLINE" | "IDLE"
): Promise<number | null> {
  try {
    const result = await prisma.presenceLog.updateMany({
      where: { userId, projectId, sessionEnd: null },
      data: { status },
    });
    return result.count;
  } catch (err) {
    console.error("updateStatus error:", err);
    return null;
  }
}

/**
 * End all open sessions for a user/project by setting sessionEnd, duration, and OFFLINE.
 * Returns void — errors are logged.
 */
export async function logEndSession(
  userId: string,
  projectId: string
): Promise<void> {
  try {
    const openSessions = await prisma.presenceLog.findMany({
      where: { userId, projectId, sessionEnd: null },
    });

    if (!openSessions || openSessions.length === 0) return;

    const now = new Date();

    for (const session of openSessions) {
      const minutes = Math.max(
        1,
        Math.floor((now.getTime() - session.sessionStart.getTime()) / 60000)
      );
      // update each session

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
