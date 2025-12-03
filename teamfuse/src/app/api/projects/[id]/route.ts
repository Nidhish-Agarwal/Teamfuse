import { withAuth } from "@/lib/withAuth";
import { AppError } from "@/lib/errors/AppError";
import { handleRouteError } from "@/lib/errors/handleRouteError";
import { sendSuccess } from "@/lib/responseHandler";
import { getProjectById } from "@/lib/services/projectServices";
import { ProjectDashboardResponse } from "@/lib/interfaces/projectDashboardResponse";

export const GET = withAuth(async (req, user) => {
  try {
    const projectId = req.url.split("/").pop();
    if (!projectId) {
      throw new AppError("Missing project ID", "BAD_REQUEST", 400);
    }

    const data: ProjectDashboardResponse = await getProjectById(
      projectId,
      user.id
    );

    const { project, taskSummary, githubSummary, latestInsight } = data;

    return sendSuccess(
      {
        project,

        members: project.members.map((m) => ({
          memberId: m.id,
          userId: m.user.id,
          name: m.user.name,
          email: m.user.email,
          avatarUrl: m.user.avatarUrl,
          role: m.role,
          status: m.status,
        })),

        taskSummary,

        recentMessages: project.chatMessages.reverse(), // oldest first

        githubSummary,

        latestInsight,
      },
      "Successfully fetched project dashboard data"
    );
  } catch (err) {
    return handleRouteError(err);
  }
});
