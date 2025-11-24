import { NextRequest } from "next/server";
import { withAuth } from "@/lib/withAuth";
import { logStartSession } from "@/lib/presence/logPresence";
import { sendSuccess, sendError } from "@/lib/responseHandler";

export const POST = withAuth(async (req: NextRequest, user) => {
  try {
    const { projectId } = await req.json();

    if (!projectId) {
      return sendError("Project ID required", "BAD_REQUEST", 400);
    }

    const session = await logStartSession(user.id, projectId);

    if (!session) {
      return sendError("Failed to start session", "INTERNAL_ERROR", 500);
    }

    return sendSuccess(
      { sessionId: session.id },
      "Session started successfully"
    );
  } catch (error) {
    console.error("Error starting session:", error);
    return sendError("Failed to start session", "INTERNAL_ERROR", 500, error);
  }
});
