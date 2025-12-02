import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/withAuth";
import { sendSuccess, sendError } from "@/lib/responseHandler";

export const GET = withAuth(async (req: NextRequest, user) => {
  try {
    const projectId = req.nextUrl.pathname.split("/")[3];

    if (!projectId) {
      return sendError("Missing project ID", "BAD_REQUEST", 400);
    }

    const membership = await prisma.projectMember.findFirst({
      where: { projectId, userId: user.id, status: "ACCEPTED" },
      include: { project: true },
    });

    if (!membership || membership.role !== "LEADER") {
      return sendError("Not allowed", "FORBIDDEN", 403);
    }

    const members = await prisma.projectMember.findMany({
      where: { projectId, status: "ACCEPTED" },
      include: { user: true },
    });

    const presence = await prisma.presenceLog.groupBy({
      by: ["userId"],
      where: { projectId },
      _sum: { duration: true },
      _count: true,
    });

    const commits = await prisma.gitHubActivity.groupBy({
      by: ["userId"],
      where: { projectId },
      _sum: {
        commitCount: true,
        prCount: true,
        linesAdded: true,
        linesDeleted: true,
      },
    });

    const chatCounts = await prisma.chatMessage.groupBy({
      by: ["senderId"],
      where: { projectId },
      _count: true,
    });

    const taskWeights = await prisma.task.groupBy({
      by: ["assigneeId"],
      where: { projectId },
      _sum: { weight: true },
    });

    const sentiment = await prisma.chatMessage.groupBy({
      by: ["aiLabel"],
      where: { projectId },
      _count: true,
    });

    const allTasks = await prisma.task.findMany({ where: { projectId } });
    const total = allTasks.length;
    const done = allTasks.filter((t) => t.status === "DONE").length;

    const projectCompletionRate =
      total === 0 ? 0 : Math.round((done / total) * 100);

    const userCompletion = members.map((m) => {
      const assigned = allTasks.filter((t) => t.assigneeId === m.userId);
      const done = assigned.filter((t) => t.status === "DONE");

      return {
        userId: m.userId,
        rate:
          assigned.length === 0
            ? 0
            : Math.round((done.length / assigned.length) * 100),
      };
    });

    const bottlenecks = userCompletion.filter(
      (u) => u.rate < projectCompletionRate * 0.5
    );

    return sendSuccess(
      {
        members,
        presence,
        commits,
        chatCounts,
        taskWeights,
        sentiment,
        projectCompletionRate,
        bottlenecks,
        userCompletion,
        aiSummary:
          bottlenecks.length > 0
            ? "Some members have significantly low completion."
            : "Team performance is stable.",
      },
      "Team performance loaded"
    );
  } catch (err) {
    console.error(err);
    return sendError("Internal error", "INTERNAL_ERROR", 500);
  }
});
