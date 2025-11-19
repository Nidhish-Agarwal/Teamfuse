import { prisma } from "@/lib/prisma";

export async function getPresenceSnapshot(projectId: string) {
  // Get all project members first
  const projectMembers = await prisma.projectMember.findMany({
    where: {
      projectId,
      status: "ACCEPTED",
    },
    include: {
      user: { select: { id: true, name: true, avatarUrl: true } },
    },
  });

  // Get presence logs
  const logs = await prisma.presenceLog.findMany({
    where: { projectId },
    include: {
      user: { select: { id: true, name: true, avatarUrl: true } },
    },
    orderBy: { sessionStart: "desc" },
  });

  const presenceMap = new Map();

  // Initialize with all project members
  projectMembers.forEach((member) => {
    presenceMap.set(member.userId, {
      userId: member.userId,
      name: member.user.name,
      avatarUrl: member.user.avatarUrl,
      status: "OFFLINE", // Default status
      lastActive: new Date().toISOString(),
      totalActiveMinutes: 0,
    });
  });

  // Update with actual presence data
  for (const log of logs) {
    if (presenceMap.has(log.userId)) {
      const member = presenceMap.get(log.userId);
      member.status = log.status;
      member.lastActive = log.sessionEnd || log.sessionStart;
      member.totalActiveMinutes += log.duration || 0;
    } else {
      // Include users with presence logs even if not current members
      presenceMap.set(log.userId, {
        userId: log.userId,
        name: log.user.name,
        avatarUrl: log.user.avatarUrl,
        status: log.status,
        lastActive: log.sessionEnd || log.sessionStart,
        totalActiveMinutes: log.duration || 0,
      });
    }
  }

  return Array.from(presenceMap.values());
}
