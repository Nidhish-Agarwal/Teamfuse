import { NextRequest } from "next/server";
import { withAuth } from "@/lib/withAuth";
import { prisma } from "@/lib/prisma";
import { sendSuccess, sendError } from "@/lib/responseHandler";

export const GET = withAuth(async (req: NextRequest, user) => {
  try {
    // ✅ Better URL parsing
    const url = new URL(req.url);
    const pathSegments = url.pathname.split("/");
    const projectId = pathSegments[3]; // /api/projects/[id]/presence/time

    if (!projectId) {
      return sendError("Missing project ID", "BAD_REQUEST", 400);
    }

    const logs = await prisma.presenceLog.findMany({
      where: { userId: user.id, projectId },
    });

    let totalAll = 0;
    let totalToday = 0;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (const log of logs) {
      const mins = log.duration || 0;
      totalAll += mins;

      if (new Date(log.sessionStart) >= today) {
        totalToday += mins;
      }
    }

    return sendSuccess(
      {
        todayMinutes: totalToday,
        todayHours: Number((totalToday / 60).toFixed(2)),
        totalMinutes: totalAll,
        totalHours: Number((totalAll / 60).toFixed(2)),
      },
      "Work summary loaded"
    );
  } catch (err) {
    console.error("Error fetching work summary:", err);
    return sendError("Failed to load work summary", "INTERNAL_ERROR", 500, err);
  }
});
