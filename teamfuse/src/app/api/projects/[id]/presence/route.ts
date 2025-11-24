import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/withAuth";
import { sendSuccess, sendError } from "@/lib/responseHandler";

export const GET = withAuth(async (req: NextRequest, user) => {
  try {
    const url = new URL(req.url);
    const projectId = url.pathname.split("/")[3];

    if (!projectId) {
      return sendError("Missing project ID", "BAD_REQUEST", 400);
    }

    const members = await prisma.projectMember.findMany({
      where: { projectId, status: "ACCEPTED" },
      include: {
        user: {
          select: { id: true, name: true, avatarUrl: true },
        },
      },
    });

    const userIds = members.map((m) => m.userId);

    const logs = await prisma.presenceLog.findMany({
      where: {
        projectId,
        userId: { in: userIds },
      },
      orderBy: { sessionStart: "desc" },
    });

    const now = new Date();

    const result = userIds.map((userId) => {
      const userLogs = logs.filter((l) => l.userId === userId);

      if (userLogs.length === 0) {
        const member = members.find((m) => m.userId === userId)!;
        return {
          userId,
          name: member.user.name,
          avatarUrl: member.user.avatarUrl,
          status: "OFFLINE",
          totalActiveMinutes: 0,
          lastActive: "Never",
        };
      }

      const latest = userLogs[0];
      const lastActive = (
        latest.sessionEnd || latest.sessionStart
      ).toISOString();

      let totalMinutes = 0;
      for (const log of userLogs) {
        let minutes = 0;

        if (log.duration) {
          minutes = log.duration;
        } else if (log.sessionEnd) {
          const ms = log.sessionEnd.getTime() - log.sessionStart.getTime();
          minutes = Math.max(1, Math.floor(ms / 60000));
        } else {
          // ACTIVE SESSION - count up to current time
          const ms = now.getTime() - log.sessionStart.getTime();
          minutes = Math.max(1, Math.floor(ms / 60000));
        }

        if (log.status === "ONLINE" || log.status === "FOCUSED") {
          totalMinutes += minutes;
        }
      }

      const member = members.find((m) => m.userId === userId)!;

      return {
        userId,
        name: member.user.name,
        avatarUrl: member.user.avatarUrl,
        status: latest.status,
        totalActiveMinutes: totalMinutes,
        lastActive,
      };
    });

    return sendSuccess(result, "Presence loaded");
  } catch (err) {
    console.error("Presence API error:", err);
    return sendError("Failed to load presence", "INTERNAL_ERROR", 500, err);
  }
});
