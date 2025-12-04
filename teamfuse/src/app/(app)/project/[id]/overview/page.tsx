import ProjectHeader from "@/components/project/overview/ProjectHeader";
import TeamMembers from "@/components/project/overview/TeamMembers";
import QuickStats from "@/components/project/overview/QuickStats";
import AISummary from "@/components/project/overview/AISummary";
import { getProjectById } from "@/lib/services/projectServices";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { ProjectDashboardResponse } from "@/lib/interfaces/projectDashboardResponse";

import ErrorUnauthorized from "@/components/shared/ErrorUnauthorized";
import ErrorProjectNotFound from "@/components/shared/ErrorProjectNotFound";
import ErrorNoAccess from "@/components/shared/ErrorNoAccess";

export default async function OverviewTab({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getServerSession(authOptions);
  const { id } = await params;

  const currentUserId = session?.user?.id;

  // No session or missing user ID
  if (!currentUserId) {
    return <ErrorUnauthorized />;
  }

  let project, taskSummary, githubSummary, latestInsight;
  try {
    const data: ProjectDashboardResponse = await getProjectById(
      id,
      currentUserId
    );
    ({ project, taskSummary, githubSummary, latestInsight } = data);
  } catch {
    return <ErrorNoAccess />;
  }

  if (!project) {
    return <ErrorProjectNotFound />;
  }

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
          name: m.user.name || "",
          email: m.user.email || "",
          avatarUrl: m.user.avatarUrl ?? "",
          role: m.role,
          status: m.status,
        }))}
        projectId={id}
        currentUserId={currentUserId}
      />

      <QuickStats
        stats={{
          tasks: taskSummary,
          github: githubSummary,
          messages: project?.chatMessages?.length,
        }}
      />

      <AISummary insight={latestInsight} />
    </div>
  );
}
