import { withAuth } from "@/lib/withAuth";
import { AppError } from "@/lib/errors/AppError";
import { handleRouteError } from "@/lib/errors/handleRouteError";
import { sendSuccess } from "@/lib/responseHandler";
import { getProjectById } from "@/lib/services/projectServices";
import { NextRequest } from "next/server";

export async function GET(
  req: NextRequest,
  context: { params: Promise<Record<string, string>> }
) {
  await context.params;

  return withAuth(async (req, user) => {
    try {
      const projectId = req.url.split("/").pop();
      if (!projectId) {
        throw new AppError("Missing project ID", "BAD_REQUEST", 400);
      }

      const { project, taskSummary, githubSummary, latestInsight } =
        await getProjectById(projectId, user.id);

      return sendSuccess(
        {
          project,

          members: project.members.map(
            (m: (typeof project.members)[number]) => ({
              memberId: m.id,
              userId: m.user.id,
              name: m.user.name,
              email: m.user.email,
              avatarUrl: m.user.avatarUrl,
              role: m.role,
              status: m.status,
            })
          ),

          taskSummary,

          recentMessages: project.chatMessages.reverse(),

          githubSummary,

          latestInsight,
        },
        "Successfully fetched project dashboard data"
      );
    } catch (err) {
      return handleRouteError(err);
    }
  })(req, { params: {} });
}
