import { NextRequest } from "next/server";
import { withAuth } from "@/lib/withAuth";
import { sendSuccess, sendError } from "@/lib/responseHandler";
import { getProjectById } from "@/lib/services/projectServices";

export async function GET(
  req: NextRequest,
  context: { params: Promise<Record<string, string>> }
) {
  const params = await context.params;
  const projectId = params.id;

  return withAuth(async (_req: NextRequest, user) => {
    try {
      if (!projectId) {
        return sendError("Missing project ID", "BAD_REQUEST", 400);
      }

      const project = getProjectById(projectId, user.id);

      return sendSuccess(project, "Overview data loaded");
    } catch (err) {
      console.error("Error fetching overview:", err);
      return sendError(
        "Server error fetching overview",
        "INTERNAL_ERROR",
        500,
        err
      );
    }
  })(req, { params: {} });
}
