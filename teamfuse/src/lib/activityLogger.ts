/* eslint-disable @typescript-eslint/no-explicit-any */
import { prisma } from "@/lib/prisma";

/**
 * Logs user activity and updates project heatmap
 */
export async function logActivity({
  userId,
  projectId,
  type,
  metadata = {},
}: {
  userId: string;
  projectId: string;
  type:
    | "COMMIT"
    | "TASK_CREATED"
    | "TASK_COMPLETED"
    | "MESSAGE_SENT"
    | "LOGIN"
    | "LOGOUT"
    | "FEEDBACK_GIVEN";
  metadata?: Record<string, any>;
}) {
  try {
    // 1️⃣  Record event in ActivityLog
    await prisma.activityLog.create({
      data: {
        userId,
        projectId,
        type,
        metadata,
      },
    });

    // 2️⃣  Update Hourly Heatmap Entry
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0–6
    const hourOfDay = now.getHours(); // 0–23

    await prisma.heatmapEntry.upsert({
      where: {
        // Custom composite key (pseudo until you add @@unique in schema)
        projectId_userId_dayOfWeek_hourOfDay: {
          projectId,
          userId,
          dayOfWeek,
          hourOfDay,
        } as any,
      },
      update: {
        activityCount: { increment: 1 },
        updatedAt: now,
      },
      create: {
        projectId,
        userId,
        dayOfWeek,
        hourOfDay,
        activityCount: 1,
      },
    });

    console.log(`✅ Activity logged: ${type} for project ${projectId}`);
  } catch (err) {
    console.error("❌ Activity logging failed:", err);
  }
}
