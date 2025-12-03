import { NextRequest } from "next/server";
import { withAuth } from "@/lib/withAuth";
import { logEndSession } from "@/lib/presence/logPresence";
import { sendSuccess, sendError } from "@/lib/responseHandler";

export async function POST(
  req: NextRequest,
  context: { params: Promise<Record<string, string>> }
) {
  await context.params;

  return withAuth(async (req: NextRequest, user) => {
    try {
      const { projectId } = await req.json();

      if (!projectId) {
        return sendError("Project ID required", "BAD_REQUEST", 400);
      }

      await logEndSession(user.id, projectId);

      return sendSuccess(null, "Session ended successfully");
    } catch (error) {
      console.error("Error ending session:", error);
      return sendError("Failed to end session", "INTERNAL_ERROR", 500, error);
    }
  })(req, { params: {} });
}
