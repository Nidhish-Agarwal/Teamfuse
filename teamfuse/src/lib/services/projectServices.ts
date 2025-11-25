import { prisma } from "@/lib/prisma";
import { AppError } from "../errors/AppError";

export async function getProjectById(projectId: string, userId: string) {
  try {
    // Check if user is a member of the project
    const membership = await prisma.projectMember.findFirst({
      where: { projectId, userId: userId, status: "ACCEPTED" },
    });

    if (!membership) {
      throw new AppError(
        "You are not a member of this project",
        "FORBIDDEN",
        403
      );
    }

    // Fetch full project dashboard data
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                avatarUrl: true,
              },
            },
          },
        },

        tasks: {
          select: {
            id: true,
            title: true,
            status: true,
            assigneeId: true,
            priority: true,
          },
        },

        chatMessages: {
          orderBy: { createdAt: "desc" },
          take: 10,
          include: {
            sender: {
              select: { id: true, name: true, avatarUrl: true },
            },
          },
        },

        githubData: {
          orderBy: { weekStart: "desc" },
          take: 1,
        },

        insights: {
          orderBy: { generatedAt: "desc" },
          take: 1,
        },
      },
    });

    if (!project) {
      throw new AppError("Project not found", "NOT_FOUND", 404);
    }

    // ---- Transform data for frontend ---- //
    const taskSummary = {
      total: project.tasks.length,
      todo: project.tasks.filter((t) => t.status === "PENDING").length,
      inProgress: project.tasks.filter((t) => t.status === "IN_PROGRESS")
        .length,
      completed: project.tasks.filter((t) => t.status === "COMPLETED").length,
      assignedToMe: project.tasks.filter((t) => t.assigneeId === userId).length,
    };

    const githubSummary = project.githubData[0] ?? {
      commitCount: 0,
      prCount: 0,
      linesAdded: 0,
      linesDeleted: 0,
    };

    const latestInsight = project.insights[0] ?? null;

    return { project, taskSummary, githubSummary, latestInsight };
  } catch (error) {
    throw error;
  }
}

export async function getAllProjectsForUser(userId: string) {
  try {
    const acceptedRaw = await prisma.project.findMany({
      where: {
        members: {
          some: { userId, status: "ACCEPTED" },
        },
      },
      include: {
        members: {
          where: { userId },
          select: {
            role: true,
            status: true,
          },
        },
      },
    });

    const pendingRaw = await prisma.project.findMany({
      where: {
        members: {
          some: { userId, status: "PENDING" },
        },
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
          },
        },
        members: {
          where: { userId },
          select: {
            role: true,
            status: true,
          },
        },
      },
    });

    const accepted = acceptedRaw.map((p) => ({
      ...p,
      role: p.members[0]?.role ?? null,
    }));

    const pending = pendingRaw.map((p) => ({
      ...p,
      role: p.members[0]?.role ?? null,
    }));

    return { accepted, pending };
  } catch (error) {
    throw error;
  }
}
