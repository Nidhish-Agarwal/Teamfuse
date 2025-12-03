import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/withAuth";
import { sendSuccess, sendError } from "@/lib/responseHandler";
import { User } from "@/lib/types/user";

export async function GET(
  req: NextRequest,
  context: { params: Promise<Record<string, string>> }
) {
  const resolved = await context.params;
  return withAuth(handler)(req, { params: resolved });
}

async function handler(
  _req: NextRequest,
  user: User,
  _context: { params: Record<string, string> }
) {
  try {
    const sessions = await prisma.refreshToken.findMany({
      where: {
        userId: user.id,
        revokedAt: null,
      },
      select: {
        id: true,
        createdAt: true,
        lastUsedAt: true,
        deviceName: true,
        userAgent: true,
        ipAddress: true,
        location: true,
        expiresAt: true,
      },
      orderBy: { lastUsedAt: "desc" },
    });

    return sendSuccess(
      { sessions, count: sessions.length },
      "Active sessions fetched successfully"
    );
  } catch (error) {
    console.error("Error fetching user sessions:", error);
    return sendError("Internal Server Error", "INTERNAL_SERVER_ERROR", 500);
  }
}
