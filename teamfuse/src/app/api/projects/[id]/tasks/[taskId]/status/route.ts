import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendError, sendSuccess } from "@/lib/responseHandler";
import { handleRouteError } from "@/lib/errors/handleRouteError";
import { withAuth } from "@/lib/withAuth";
import { invalidateTaskCache } from "@/lib/cache/taskCache";
import { invalidateProjectCache } from "@/lib/cache/projectCache";

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string; taskId: string }> }
) {
  const params = await context.params;
  return withAuth(async (req: NextRequest, user) => {
    try {
      const taskId = params.taskId;
      const projectId = params.id;
      const { status } = await req.json();

      if (!projectId) {
        return sendError("Missing project ID", "BAD_REQUEST", 400);
      }

      const membership = await prisma.projectMember.findUnique({
        where: {
          userId_projectId: {
            userId: user.id,
            projectId,
          },
        },
      });

      if (!membership) return sendError("Forbidden", "FORBIDDEN", 403);

      const updated = await prisma.task.update({
        where: { id: taskId },
        data: { status, updatedAt: new Date() },
      });

      await invalidateTaskCache(projectId);
      await invalidateProjectCache(projectId);

      return sendSuccess(updated, "Successfully updated the task");
    } catch (err) {
      console.error(err);
      console.error("Error in Task status update", err);
      return handleRouteError(err);
    }
  })(req, { params });
}
