/* eslint-disable @typescript-eslint/no-explicit-any */
import { prisma } from "@/lib/prisma";

export async function logStartSession(userId: string, projectId: string) {
  try {
    const exists = await prisma.presenceLog.findFirst({
      where: { userId, projectId, sessionEnd: null },
    });

    if (exists) return exists;

    return await prisma.presenceLog.create({
      data: {
        userId,
        projectId,
        status: "ONLINE",
        sessionStart: new Date(),
      },
    });
  } catch (error) {
    console.error("Error creating presence log:", error);
    return null;
  }
}

export async function updateStatus(
  userId: string,
  projectId: string,
  status: string
) {
  try {
    return await prisma.presenceLog.updateMany({
      where: { userId, projectId, sessionEnd: null },
      data: { status: status as any },
    });
  } catch (error) {
    console.error("Error updating status:", error);
  }
}

export async function logEndSession(userId: string, projectId: string) {
  try {
    const active = await prisma.presenceLog.findFirst({
      where: { userId, projectId, sessionEnd: null },
    });

    if (!active) return;

    const now = new Date();
    const minutes = Math.max(
      1,
      Math.floor((now.getTime() - active.sessionStart.getTime()) / 60000)
    );

    return await prisma.presenceLog.update({
      where: { id: active.id },
      data: {
        sessionEnd: now,
        duration: minutes,
        status: "OFFLINE",
      },
    });
  } catch (error) {
    console.error("Error ending session:", error);
  }
}
