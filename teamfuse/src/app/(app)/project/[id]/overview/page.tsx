import ProjectHeader from "@/components/project/overview/ProjectHeader";
import TeamMembers from "@/components/project/overview/TeamMembers";
import QuickStats from "@/components/project/overview/QuickStats";
import AISummary from "@/components/project/overview/AISummary";
import { getProjectById } from "@/lib/services/projectServices";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

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

  let project, members, stats, latestInsight;
  try {
    ({ project, members, stats, latestInsight } = await getProjectById(
      id,
      currentUserId
    ));
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
        members={members.map(
          (m: {
            memberId: string;
            userId: string;
            name: string;
            email: string;
            avatarUrl: string | null;
            role: string;
            status: string;
          }) => ({
            memberId: m.memberId,
            userId: m.userId,
            name: m.name,
            email: m.email,
            avatarUrl: m.avatarUrl ?? "",
            role: m.role,
            status: m.status,
          })
        )}
        projectId={id}
        currentUserId={currentUserId}
      />

      <QuickStats
        stats={{
          tasks: stats.tasks,
          github: stats.github,
          messages: stats.messages,
        }}
      />

      <AISummary insight={latestInsight} />
    </div>
  );
}
