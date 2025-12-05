/* eslint-disable @typescript-eslint/no-explicit-any */
import prisma from "./prisma";

const idleTimers = new Map<string, NodeJS.Timeout>();

export class SessionManager {
  private static readonly IDLE_TIMEOUT = 5 * 60 * 1000;

  static async startSession(userId: string, projectId: string) {
    const now = new Date();

    const existing = await prisma.presenceLog.findFirst({
      where: { userId, projectId, isActive: true },
    });

    if (existing) {
      this.startIdleTimer(userId, projectId);
      return existing;
    }

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

    if (idleTimers.has(key)) clearTimeout(idleTimers.get(key)!);

    const timer = setTimeout(async () => {
      await this.setStatus(userId, projectId, "IDLE");
      idleTimers.delete(key);
    }, this.IDLE_TIMEOUT);

    idleTimers.set(key, timer);
  }

  static async resetIdle(userId: string, projectId: string) {
    const session = await prisma.presenceLog.findFirst({
      where: { userId, projectId, isActive: true },
    });

    if (session?.status === "IDLE") {
      await prisma.presenceLog.update({
        where: { id: session.id },
        data: { status: "ONLINE" },
      });
    }

    this.startIdleTimer(userId, projectId);
  }

  static async setStatus(userId: string, projectId: string, status: any) {
    await prisma.presenceLog.updateMany({
      where: { userId, projectId, isActive: true },
      data: { status },
    });
  }

  static async endSession(userId: string, projectId: string) {
    const now = new Date();
    const key = `${userId}-${projectId}`;

    if (idleTimers.has(key)) {
      clearTimeout(idleTimers.get(key)!);
      idleTimers.delete(key);
    }

    const session = await prisma.presenceLog.findFirst({
      where: { userId, projectId, isActive: true },
    });

    if (!session) return;

    const duration = Math.floor(
      (now.getTime() - session.sessionStart.getTime()) / 60000
    );

    await prisma.presenceLog.update({
      where: { id: session.id },
      data: {
        sessionEnd: now,
        duration,
        status: "OFFLINE",
        isActive: false,
      },
    });
  }

  static async getSessionsForTimeCalculation(
    userId: string,
    projectId: string
  ) {
    return prisma.presenceLog.findMany({
      where: { userId, projectId },
      orderBy: { sessionStart: "asc" },
    });
  }
}
