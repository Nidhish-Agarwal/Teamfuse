import { AppError } from "@/lib/errors/AppError";
import { prisma } from "@/lib/prisma";

export async function respondToInvite(
  projectId: string,
  userId: string,
  action: "ACCEPT" | "DECLINE"
) {
  const membership = await prisma.projectMember.findUnique({
    where: {
      userId_projectId: { userId, projectId },
    },
  });

  if (!membership) {
    throw new AppError("This invite is no longer pending", "BAD_REQUEST", 400);
  }

  if (membership.status !== "PENDING") {
    throw new AppError("This invite is no longer pending", "BAD_REQUEST", 400);
  }

  return prisma.projectMember.update({
    where: {
      userId_projectId: { userId, projectId },
    },
    data: {
      status: action === "ACCEPT" ? "ACCEPTED" : "DECLINED",
      joinedAt: action === "ACCEPT" ? new Date() : null,
    },
  });
}
