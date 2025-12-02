import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/withAuth";
import { sendSuccess, sendError } from "@/lib/responseHandler";

export const GET = withAuth(async (req: NextRequest, user) => {
  try {
    const parts = req.nextUrl.pathname.split("/");
    const projectId = parts[3];

    if (!projectId) {
      return sendError("Missing project ID", "BAD_REQUEST", 400);
    }

    // Validate membership
    const membership = await prisma.projectMember.findFirst({
      where: {
        userId: user.id,
        projectId,
        status: "ACCEPTED",
      },
    });

    if (!membership) {
      return sendError("Not part of this project", "FORBIDDEN", 403);
    }

    const userId = user.id;

    const tasks = await prisma.task.findMany({
      where: { assigneeId: userId, projectId },
      select: { status: true },
    });

    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((t) => t.status === "DONE").length;

    const taskCompletionRate =
      totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

    const feedback = await prisma.feedback.findMany({
      where: { toUserId: userId, projectId },
      select: { effort: true, collaboration: true, reliability: true },
    });

    let avgFeedback = 0;
    if (feedback.length > 0) {
      const totalScore = feedback.reduce(
        (acc, f) => acc + f.effort + f.collaboration + f.reliability,
        0
      );
      avgFeedback = Number((totalScore / (feedback.length * 3)).toFixed(2));
    }

    const github = await prisma.gitHubActivity.findMany({
      where: { userId, projectId },
      orderBy: { weekStart: "asc" },
    });

    const chatCount = await prisma.chatMessage.count({
      where: { senderId: userId, projectId },
    });

    const chatParticipationScore = Math.min(100, chatCount);

    const insights = await prisma.insight.findMany({
      where: { projectId },
      orderBy: { generatedAt: "desc" },
      take: 20,
    });

    const allProjectTasks = await prisma.task.findMany({
      where: { projectId },
      select: { status: true, assigneeId: true },
    });

    const projectCompleted = allProjectTasks.filter(
      (t) => t.status === "DONE"
    ).length;

    const projectTotal = allProjectTasks.length;

    const teamRate =
      projectTotal === 0
        ? 0
        : Math.round((projectCompleted / projectTotal) * 100);

    const peerBenchmark = {
      userRate: taskCompletionRate,
      teamRate,
      difference: taskCompletionRate - teamRate,
    };

    return sendSuccess(
      {
        taskCompletionRate,
        avgFeedback,
        github,
        chatParticipationScore,
        insights,
        peerBenchmark,
      },
      "Project-specific performance loaded"
    );
  } catch (err) {
    console.error("Error loading performance:", err);
    return sendError("Failed to load performance", "INTERNAL_ERROR", 500, err);
  }
});
