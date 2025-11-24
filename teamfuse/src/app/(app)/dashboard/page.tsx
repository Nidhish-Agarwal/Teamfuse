import TeamFuseDashboard from "@/components/TeamFuseDashboard";
import { authOptions } from "@/lib/authOptions";
import { getAllProjectsForUser } from "@/lib/services/projectServices";
import { getServerSession } from "next-auth";
// Mock Data

export default async function Page() {
  const session = await getServerSession(authOptions);
  const projects = await getAllProjectsForUser(session!.user.id);
  console.log("Projects fetched in dashboard page:", projects.pending);
  return (
    <TeamFuseDashboard
      projects={projects.accepted}
      pendingProjects={projects.pending}
    />
  );
}
