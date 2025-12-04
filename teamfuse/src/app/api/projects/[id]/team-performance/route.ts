import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/withAuth";
import { sendSuccess, sendError } from "@/lib/responseHandler";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;
  return withAuth(async (_, user) => {
    try {
      const projectId = params.id;
      if (!projectId)
        return sendError("Missing project ID", "BAD_REQUEST", 400);

      const membership = await prisma.projectMember.findFirst({
        where: { projectId, userId: user.id, status: "ACCEPTED" },
      });

      if (!membership || membership.role !== "LEADER") {
        return sendError("Not allowed", "FORBIDDEN", 403);
      }

      const members = await prisma.projectMember.findMany({
        where: { projectId, status: "ACCEPTED" },
        include: { user: true },
      });

      // PRESENCE
      const presence = await prisma.presenceLog.groupBy({
        by: ["userId"],
        where: { projectId },
        _sum: { duration: true },
      });

      // WEEKLY GitHub activity
      const commits = await prisma.gitHubActivity.groupBy({
        by: ["userId"],
        where: { projectId },
        _sum: {
          commitCount: true,
          prCount: true,
        },
      });

      // ⭐ Correct: Group PRs by authorLogin
      const prCounts = await prisma.pullRequest.groupBy({
        by: ["authorLogin"],
        where: { projectId },
        _count: true,
      });

      // CHAT
      const chatCounts = await prisma.chatMessage.groupBy({
        by: ["senderId"],
        where: { projectId },
        _count: true,
      });

      // TASK DATA
      const allTasks = await prisma.task.findMany({
        where: { projectId },
      });

      // WORKLOAD FAIRNESS (same UI shape)
      const taskWeights = members.map((m) => {
        const assigned = allTasks.filter((t) => t.assigneeId === m.userId);
        return {
          assigneeId: m.userId,
          _sum: {
            weight: assigned.reduce((a, t) => a + t.weight, 0),
          },
        };
      });

      // PROJECT COMPLETION
      const doneCount = allTasks.filter((t) => t.status === "DONE").length;

      const projectCompletionRate =
        allTasks.length === 0
          ? 0
          : Math.round((doneCount / allTasks.length) * 100);

      // USER COMPLETION
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

      // IMPROVED BOTTLENECK DETECTION
      const avg =
        userCompletion.reduce((a, b) => a + b.rate, 0) /
        (userCompletion.length || 1);

      const bottlenecks = userCompletion.filter((u) => u.rate < avg * 0.6);

      // SENTIMENT
      const sentiment = await prisma.chatMessage.groupBy({
        by: ["aiLabel"],
        where: { projectId },
        _count: true,
      });

      return sendSuccess(
        {
          members,
          presence,
          commits,
          prCounts,
          chatCounts,
          taskWeights,
          sentiment,
          projectCompletionRate,
          userCompletion,
          bottlenecks,
          aiSummary:
            bottlenecks.length === 0
              ? "Team looks balanced."
              : `${bottlenecks.length} members may need support.`,
        },
        "Team performance loaded"
      );
    } catch (err) {
      console.error(err);
      return sendError("Internal error", "INTERNAL_ERROR", 500);
    }
  })(req, { params });
}
