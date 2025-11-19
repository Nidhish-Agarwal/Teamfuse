import { NextRequest } from "next/server";
import { withAuth } from "@/lib/withAuth";
import { prisma } from "@/lib/prisma";
import { sendSuccess, sendError } from "@/lib/responseHandler";
import { getPresenceSnapshot } from "@/lib/presence/getPresence";

export const GET = withAuth(async (req: NextRequest, user) => {
  try {
    // ✅ Better URL parsing
    const url = new URL(req.url);
    const pathSegments = url.pathname.split('/');
    const projectId = pathSegments[3]; // /api/projects/[id]/presence

    if (!projectId) {
      return sendError("Missing project ID", "BAD_REQUEST", 400);
    }

    // Check access level
    const member = await prisma.projectMember.findFirst({
      where: {
        userId: user.id,
        projectId,
        status: "ACCEPTED",
      },
    });

    if (!member) {
      return sendError("Not authorized for this project", "FORBIDDEN", 403);
    }

    // Build presence snapshot
    const presence = await getPresenceSnapshot(projectId);

    return sendSuccess(presence, "Presence loaded");
  } catch (err) {
    console.error("Presence fetch error:", err);
    return sendError("Presence fetch failed", "FETCH_ERROR", 500, err);
  }
});