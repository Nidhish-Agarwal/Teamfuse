import { NextRequest } from "next/server";
import { withAuth } from "@/lib/withAuth";
import { prisma } from "@/lib/prisma";
import { sendSuccess, sendError } from "@/lib/responseHandler";

export const GET = withAuth(async (req: NextRequest, user) => {
  try {
    const url = new URL(req.url);
    const projectId = url.pathname.split("/")[3];

    // Get ALL sessions (both completed and active)
    const logs = await prisma.presenceLog.findMany({
      where: {
        userId: user.id,
        projectId,
        OR: [{ status: "ONLINE" }, { status: "FOCUSED" }],
      },
      orderBy: { sessionStart: "desc" },
    });

    const now = new Date();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let totalAll = 0;
    let totalToday = 0;

    for (const log of logs) {
      let minutes = 0;

      if (log.duration) {
        // Completed session with stored duration
        minutes = log.duration;
      } else if (log.sessionEnd) {
        // Completed session without duration - calculate it
        const ms = log.sessionEnd.getTime() - log.sessionStart.getTime();
        minutes = Math.floor(ms / 60000);
      } else {
        // ACTIVE SESSION - calculate current duration up to now
        const ms = now.getTime() - log.sessionStart.getTime();
        minutes = Math.floor(ms / 60000);
      }

      if (minutes <= 0) minutes = 1;

      const sessionDay = new Date(log.sessionStart);
      sessionDay.setHours(0, 0, 0, 0);

      if (sessionDay.getTime() === today.getTime()) {
        totalToday += minutes;
      }

      totalAll += minutes;
    }

    return sendSuccess(
      {
        todayMinutes: totalToday,
        todayHours: Number((totalToday / 60).toFixed(2)),
        totalMinutes: totalAll,
        totalHours: Number((totalAll / 60).toFixed(2)),
        sessionCount: logs.length,
      },
      "Summary loaded"
    );
  } catch (err) {
    console.error("Time summary error:", err);
    return sendError("Failed to load summary", "INTERNAL_ERROR", 500, err);
  }
});
