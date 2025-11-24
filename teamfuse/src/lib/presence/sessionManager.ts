// src/lib/presence/sessionManager.ts
import { prisma } from "@/lib/prisma";

const idleTimers = new Map<string, NodeJS.Timeout>();

export class SessionManager {
  static async startSession(userId: string, projectId: string) {
    const now = new Date();

    // Check if there is already an active session
    const existing = await prisma.presenceLog.findFirst({
      where: { userId, projectId, isActive: true },
    });

    if (existing) {
      // Do NOT create a new session
      return existing;
    }

    // Create new session
    const session = await prisma.presenceLog.create({
      data: {
        userId,
        projectId,
        status: "ONLINE",
        sessionStart: now,
        isActive: true,
      },
    });

    this.startIdleTimer(userId, projectId);

    return session;
  }

  static startIdleTimer(userId: string, projectId: string) {
    const key = `${userId}-${projectId}`;

    if (idleTimers.has(key)) {
      clearTimeout(idleTimers.get(key));
    }

    // 5 minutes → idle
    const timer = setTimeout(
      async () => {
        await this.setStatus(userId, projectId, "IDLE");
        idleTimers.delete(key);
      },
      5 * 60 * 1000
    );

    idleTimers.set(key, timer);
  }

  static async resetIdle(userId: string, projectId: string) {
    const session = await prisma.presenceLog.findFirst({
      where: { userId, projectId, isActive: true },
    });

    if (session?.status === "IDLE") {
      await this.setStatus(userId, projectId, "ONLINE");
    }

    this.startIdleTimer(userId, projectId);
  }

  static async setStatus(
    userId: string,
    projectId: string,
    status: "ONLINE" | "IDLE" | "FOCUSED" | "OFFLINE"
  ) {
    await prisma.presenceLog.updateMany({
      where: { userId, projectId, isActive: true },
      data: { status },
    });

    if (status === "ONLINE") {
      this.startIdleTimer(userId, projectId);
    }
  }

  static async endSession(userId: string, projectId: string) {
    const now = new Date();
    const key = `${userId}-${projectId}`;

    if (idleTimers.has(key)) {
      clearTimeout(idleTimers.get(key));
      idleTimers.delete(key);
    }

    const open = await prisma.presenceLog.findMany({
      where: { userId, projectId, isActive: true },
    });

    for (const s of open) {
      const duration = Math.max(
        1,
        Math.floor((now.getTime() - s.sessionStart.getTime()) / 60000)
      );

      await prisma.presenceLog.update({
        where: { id: s.id },
        data: {
          sessionEnd: now,
          duration,
          status: "OFFLINE",
          isActive: false,
        },
      });
    }
  }
}
