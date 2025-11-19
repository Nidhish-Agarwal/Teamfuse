import ProjectHeader from "@/components/project/overview/ProjectHeader";
import TeamMembers from "@/components/project/overview/TeamMembers";
import QuickStats from "@/components/project/overview/QuickStats";
import AISummary from "@/components/project/overview/AISummary";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

interface OverviewProps {
  params: Promise<{ id: string }>;
}

export default async function OverviewTab({ params }: OverviewProps) {
  const { id } = await params; // <-- FIXED

  // Session will be null for a split second before refresh resolves
  const session = await getServerSession(authOptions);

  const currentUserId =
    session && session.user && "id" in session.user
      ? (session.user.id as string)
      : null;

  // Do NOT throw — allow refresh token to complete
  if (!currentUserId) {
    return <div className="text-white p-6">Loading...</div>;
  }

  const project = await prisma.project.findUnique({
    where: { id },
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
      tasks: true,
      chatMessages: true,
      githubData: { orderBy: { weekStart: "desc" }, take: 1 },
      insights: { orderBy: { generatedAt: "desc" }, take: 1 },
    },
  });

  if (!project) throw new Error("Project not found");

  const taskSummary = {
    total: project.tasks.length,
    todo: project.tasks.filter((t) => t.status === "PENDING").length,
    inProgress: project.tasks.filter((t) => t.status === "IN_PROGRESS").length,
    completed: project.tasks.filter((t) => t.status === "COMPLETED").length,
  };

  const githubSummary = project.githubData[0] ?? {
    commitCount: 0,
    prCount: 0,
    linesAdded: 0,
    linesDeleted: 0,
  };

  const latestInsight = project.insights[0] ?? null;

  return (
    <div className="space-y-6">
      <ProjectHeader
        overview={{
          id: project.id,
          name: project.name,
          description: project.description,
          githubRepo: project.githubRepo,
          updatedAt: project.lastActive ?? project.createdAt,
          createdById: project.createdById,
        }}
      />

      <TeamMembers
        members={project.members.map((m) => ({
          memberId: m.id,
          userId: m.user.id,
          name: m.user.name,
          email: m.user.email,
          avatarUrl: m.user.avatarUrl,
          role: m.role,
          status: m.status,
        }))}
        projectId={id}
        currentUserId={project.createdById}
      />

      <QuickStats
        stats={{
          tasks: taskSummary,
          github: githubSummary,
          messages: project.chatMessages.length,
        }}
      />

      <AISummary insight={latestInsight} />
    </div>
  );
}
