import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/withAuth";
import { sendSuccess, sendError } from "@/lib/responseHandler";

export async function GET(req: NextRequest) {
  return withAuth(async (_, user) => {
    try {
      const projectId = req.nextUrl.pathname.split("/")[3];
      if (!projectId)
        return sendError("Missing project ID", "BAD_REQUEST", 400);

      const membership = await prisma.projectMember.findFirst({
        where: { userId: user.id, projectId, status: "ACCEPTED" },
      });

      if (!membership) {
        return sendError("Not part of this project", "FORBIDDEN", 403);
      }

      const userId = user.id;

      // ⭐ Fetch GitHub login (oauthId)
      const dbUser = await prisma.user.findUnique({
        where: { id: userId },
        select: { oauthId: true },
      });

      const githubLogin = dbUser?.oauthId ?? null;

      // TASK COMPLETION
      const tasks = await prisma.task.findMany({
        where: { assigneeId: userId, projectId },
        select: { status: true },
      });

      const totalTasks = tasks.length;
      const completedTasks = tasks.filter((t) => t.status === "DONE").length;

      const taskCompletionRate =
        totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

      // FEEDBACK AVG
      const feedback = await prisma.feedback.findMany({
        where: { projectId, toUserId: userId },
      });

      const avgFeedback =
        feedback.length === 0
          ? 0
          : Number(
              (
                feedback.reduce(
                  (a, f) => a + f.effort + f.collaboration + f.reliability,
                  0
                ) /
                (feedback.length * 3)
              ).toFixed(2)
            );

      // WEEKLY GitHub activity
      const github = await prisma.gitHubActivity.findMany({
        where: { userId, projectId },
        orderBy: { weekStart: "asc" },
      });

      // ⭐ ORIGINAL & CORRECT — PRs counted by GitHub login
      const prCount = await prisma.pullRequest.count({
        where: { projectId, authorLogin: githubLogin },
      });

      // CHAT
      const chatCount = await prisma.chatMessage.count({
        where: { projectId, senderId: userId },
      });

      const chatParticipationScore = Math.min(chatCount, 100);

      // INSIGHTS
      const insights = await prisma.insight.findMany({
        where: { projectId },
        orderBy: { generatedAt: "desc" },
        take: 20,
      });

      // TEAM RATE
      const allProjectTasks = await prisma.task.findMany({
        where: { projectId },
      });

      const teamDone = allProjectTasks.filter(
        (t) => t.status === "DONE"
      ).length;

      const teamRate =
        allProjectTasks.length === 0
          ? 0
          : Math.round((teamDone / allProjectTasks.length) * 100);

      return sendSuccess(
        {
          taskCompletionRate,
          avgFeedback,
          github,
          prCount,
          chatParticipationScore,
          insights,
          peerBenchmark: {
            userRate: taskCompletionRate,
            teamRate,
            difference: taskCompletionRate - teamRate,
          },
        },
        "Project-specific performance loaded"
      );
    } catch (err) {
      console.error(err);
      return sendError("Internal error", "INTERNAL_ERROR", 500);
    }
  })(req, { params: {} });
}
