import { prisma } from "@/lib/prisma";

export async function getPresenceSnapshot(projectId: string) {
  try {
    const projectMembers = await prisma.projectMember.findMany({
      where: { projectId, status: "ACCEPTED" },
      include: {
        user: { select: { id: true, name: true, avatarUrl: true } },
      },
    });

    const userIds = projectMembers.map((m) => m.userId);

    const logs = await prisma.presenceLog.findMany({
      where: { projectId, userId: { in: userIds } },
      include: {
        user: { select: { id: true, name: true, avatarUrl: true } },
      },
      orderBy: { sessionStart: "desc" },
    });

    const presenceMap = new Map();
    const now = new Date();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Initialize member presence data
    projectMembers.forEach((member) => {
      presenceMap.set(member.userId, {
        userId: member.userId,
        name: member.user.name,
        avatarUrl: member.user.avatarUrl,
        status: "OFFLINE",
        lastActive: null,
        totalActiveMinutes: 0,
        todayMinutes: 0,
        _processed: false,
      });
    });

    const userTotalMinutes = new Map();
    const userTodayMinutes = new Map();

    userIds.forEach((id) => {
      userTotalMinutes.set(id, 0);
      userTodayMinutes.set(id, 0);
    });

    // Calculate minutes for all logs
    for (const log of logs) {
      const userId = log.userId;
      let minutes = 0;

      if (log.duration && log.duration > 0) {
        minutes = log.duration;
      } else if (log.sessionEnd) {
        const durationMs =
          log.sessionEnd.getTime() - log.sessionStart.getTime();
        minutes = Math.max(1, Math.floor(durationMs / 60000));
      } else {
        const durationMs = now.getTime() - log.sessionStart.getTime();
        minutes = Math.max(1, Math.floor(durationMs / 60000));
      }

      // Count only ONLINE or FOCUSED time
      if (log.status === "ONLINE" || log.status === "FOCUSED") {
        userTotalMinutes.set(
          userId,
          (userTotalMinutes.get(userId) || 0) + minutes
        );

        const sessionDay = new Date(log.sessionStart);
        sessionDay.setHours(0, 0, 0, 0);

        if (sessionDay.getTime() === today.getTime()) {
          userTodayMinutes.set(
            userId,
            (userTodayMinutes.get(userId) || 0) + minutes
          );
        }
      }
    }

    // Apply most recent session data
    for (const log of logs) {
      if (!presenceMap.has(log.userId)) continue;

      const entry = presenceMap.get(log.userId);

      if (!entry._processed) {
        entry.status = log.status;
        entry.lastActive = (log.sessionEnd || log.sessionStart).toISOString();
        entry.totalActiveMinutes = userTotalMinutes.get(log.userId) || 0;
        entry.todayMinutes = userTodayMinutes.get(log.userId) || 0;
        entry._processed = true;
      }
    }

    // Final output clean-up
    return Array.from(presenceMap.values()).map((m) => {
      delete m._processed;
      if (!m.lastActive) m.lastActive = "Never";
      return m;
    });
  } catch (error) {
    console.error("❌ [getPresenceSnapshot] Error:", error);
    return [];
  }
}
