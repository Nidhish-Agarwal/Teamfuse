// src/app/api/projects/[projectId]/presence/time/route.ts
import { NextRequest } from "next/server";
import { withAuth } from "@/lib/withAuth";
import { SessionManager } from "@/lib/presence/sessionManager";
import { sendSuccess } from "@/lib/responseHandler";

export const GET = withAuth(async (req: NextRequest, user) => {
  const url = new URL(req.url);
  const pathSegments = url.pathname.split("/");
  const projectsIndex = pathSegments.findIndex(
    (segment) => segment === "projects"
  );
  const projectId = pathSegments[projectsIndex + 1];

  const logs = await SessionManager.getSessionsForTimeCalculation(
    user.id,
    projectId
  );

  const now = new Date();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let totalToday = 0;
  let totalAll = 0;

  for (const log of logs) {
    if (
      log.status !== "ONLINE" &&
      log.status !== "FOCUSED" &&
      !(log.status === "OFFLINE" && log.duration != null)
    ) {
      continue;
    }

    const sessionEnd = log.sessionEnd || (log.isActive ? now : null);
    if (!sessionEnd) continue;

    const minutes =
      log.duration ??
      Math.floor((sessionEnd.getTime() - log.sessionStart.getTime()) / 60000);

    const sessionDay = new Date(log.sessionStart);
    sessionDay.setHours(0, 0, 0, 0);

    if (sessionDay.getTime() === today.getTime()) {
      totalToday += minutes;
    }

    totalAll += minutes;
  }

  const result = {
    todayMinutes: totalToday,
    todayHours: Number((totalToday / 60).toFixed(2)),
    totalMinutes: totalAll,
    totalHours: Number((totalAll / 60).toFixed(2)),
  };

  return sendSuccess(result, "Summary loaded");
});
