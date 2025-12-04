import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendError, sendSuccess } from "@/lib/responseHandler";
import { handleRouteError } from "@/lib/errors/handleRouteError";
import { withAuth } from "@/lib/withAuth";
import { invalidateTaskCache } from "@/lib/cache/taskCache";
import { invalidateProjectCache } from "@/lib/cache/projectCache";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string; taskId: string } }
) {
  // defensive: ensure params exist
  if (!params?.id || !params?.taskId) {
    return sendError("Missing route parameters", "BAD_REQUEST", 400);
  }

  return withAuth(async (req: NextRequest, user) => {
    try {
      const projectId = params.id;
      const taskId = params.taskId;

      // --- 1) Verify membership
      const membership = await prisma.projectMember.findUnique({
        where: {
          userId_projectId: {
            userId: user.id,
            projectId,
          },
        },
      });

      if (!membership) return sendError("Forbidden", "FORBIDDEN", 403);

      // Optional: if only leaders/admins can change status
      // if (membership.role !== "LEADER" && membership.role !== "ADMIN") {
      //   return sendError("Insufficient permissions", "FORBIDDEN", 403);
      // }

      // --- 2) Fetch task and ensure it belongs to this project
      const task = await prisma.task.findUnique({
        where: { id: taskId },
        select: { id: true, projectId: true, status: true },
      });

      if (!task) return sendError("Task not found", "NOT_FOUND", 404);

      if (task.projectId !== projectId) {
        return sendError(
          "Task does not belong to this project",
          "BAD_REQUEST",
          400
        );
      }

      // --- 3) Update task status with enum (safer than raw string)
      const updated = await prisma.task.update({
        where: { id: taskId },
        data: {
          status: "DONE",
          completedAt: new Date(),
        },
      });

      // --- 4) Invalidate caches
      await invalidateTaskCache(projectId);
      await invalidateProjectCache(projectId);

      return sendSuccess(updated, "Successfully updated the task");
    } catch (err) {
      console.error("Error in Task status update:", err);
      return handleRouteError(err);
    }
  })(req, { params });
}
