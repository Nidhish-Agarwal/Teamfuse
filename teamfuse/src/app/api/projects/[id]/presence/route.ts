import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendSuccess, sendError } from "@/lib/responseHandler";
import { withAuth } from "@/lib/withAuth";

interface PresenceOutput {
  userId: string;
  name: string;
  avatarUrl: string | null;
  status: string;
  totalActiveMinutes: number;
  todayMinutes: number;
  lastActive: string;
}

export async function GET(
  req: NextRequest,
  context: { params: Promise<Record<string, string>> }
) {
  await context.params;

  return withAuth(async (req: NextRequest) => {
    try {
      const url = new URL(req.url);
      const pathSegments = url.pathname.split("/");

      const projectsIndex = pathSegments.findIndex(
        (segment) => segment === "projects"
      );
      const projectId = pathSegments[projectsIndex + 1];

      if (!projectId || projectId === "presence") {
        return sendError("Missing or invalid project ID", "BAD_REQUEST", 400);
      }

      const members = await prisma.projectMember.findMany({
        where: { projectId, status: "ACCEPTED" },
        include: { user: true },
      });

      const userIds = members.map((m) => m.userId);

      const activeSessions = await prisma.presenceLog.findMany({
        where: {
          userId: { in: userIds },
          projectId,
          isActive: true,
        },
      });

      const allLogs = await prisma.presenceLog.findMany({
        where: { userId: { in: userIds }, projectId },
        orderBy: { sessionStart: "desc" },
      });

      const now = new Date();
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const out: PresenceOutput[] = [];

      for (const member of members) {
        const userLogs = allLogs.filter((l) => l.userId === member.userId);
        const userActiveSession = activeSessions.find(
          (s) => s.userId === member.userId
        );

        if (userLogs.length === 0) {
          out.push({
            userId: member.userId,
            name: member.user.name,
            avatarUrl: member.user.avatarUrl,
            status: "OFFLINE",
            totalActiveMinutes: 0,
            todayMinutes: 0,
            lastActive: "Never",
          });
          continue;
        }

        let total = 0;
        let todayMins = 0;

        for (const log of userLogs) {
          const valid =
            log.status === "ONLINE" ||
            log.status === "FOCUSED" ||
            (log.status === "OFFLINE" && log.duration != null);

          if (!valid) continue;

          const sessionEnd = log.sessionEnd || (log.isActive ? now : null);
          if (!sessionEnd) continue;

          const minutes =
            log.duration ??
            Math.floor(
              (sessionEnd.getTime() - log.sessionStart.getTime()) / 60000
            );

          total += minutes;

          const sessionDay = new Date(log.sessionStart);
          sessionDay.setHours(0, 0, 0, 0);

          if (sessionDay.getTime() === today.getTime()) {
            todayMins += minutes;
          }
        }

        const latest = userLogs[0];

        out.push({
          userId: member.userId,
          name: member.user.name,
          avatarUrl: member.user.avatarUrl,
          status: userActiveSession ? userActiveSession.status : "OFFLINE",
          totalActiveMinutes: total,
          todayMinutes: todayMins,
          lastActive: (latest.sessionEnd || latest.sessionStart).toISOString(),
        });
      }

      return sendSuccess(out, "Presence loaded");
    } catch (err) {
      console.error(err);
      return sendError("Presence error", "INTERNAL_ERROR", 500);
    }
  })(req, { params: {} });
}
