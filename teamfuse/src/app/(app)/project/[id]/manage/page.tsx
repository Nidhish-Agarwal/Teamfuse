import ManageProjectClient from "@/components/project/manage/ManageProjectClient";
import { ProjectMember, ProjectRole } from "@/generated/prisma";
import { authOptions } from "@/lib/authOptions";
import { ProjectDashboardResponse } from "@/lib/interfaces/projectDashboardResponse";
import { getMemberDetails } from "@/lib/services/memberServices";
import { getProjectById } from "@/lib/services/projectServices";
import { getServerSession } from "next-auth";

export default async function ManageTab({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getServerSession(authOptions);
  const { id: projectId } = await params;

  const currentUserId = session?.user?.id;

  // 2. No session or missing user ID
  if (!currentUserId) {
    return <div className="text-white p-6">Unauthorized</div>;
  }

  const memberDetails: ProjectMember | null = await getMemberDetails(
    projectId,
    currentUserId
  );

  const role: ProjectRole | undefined = memberDetails?.role;

  const project: ProjectDashboardResponse = await getProjectById(
    projectId,
    currentUserId
  );

  if (!role || role !== "LEADER") {
    return <div>Forbidden</div>;
  }

  return (
    <ManageProjectClient
      projectId={projectId}
      projectName={project.project.name}
    />
  );
}
