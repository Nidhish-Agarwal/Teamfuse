import PresenceWidget from "@/components/project/PresenceWidget";
import ProjectSidebar from "@/components/project/Sidebar";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { verifyAccess } from "@/lib/auth-tokens";
import { useSession } from "next-auth/react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

interface LayoutProps {
  children: React.ReactNode;
  params: { id: string };
}

export default async function ProjectLayout({ children, params }: LayoutProps) {
  // ✅ Properly await the params Promise
  const { id: projectId } = await params;
  const session = await getServerSession(authOptions);
  const currentUserId = session?.user?.id;

export default function ProjectLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-gradient-to-br from-[#0f111a] via-[#141620] to-[#1a1c25] text-white overflow-hidden">

      <ProjectSidebar />

      <div className="flex-1 overflow-y-auto px-8 py-6">
        {children}
      </div>

      <aside className="hidden lg:block w-72 border-l border-white/10 bg-white/5 backdrop-blur-xl p-6 shadow-2xl shadow-indigo-500/10">
        <PresenceWidget projectId={"replace-with-dynamic-id"} />
      {/* RIGHT PRESENCE SIDEBAR */}
      <aside className="hidden xl:block w-80 border-l border-gray-800 p-4 overflow-y-auto">
        <PresenceWidget projectId={projectId} currentUserId={currentUserId} />
      </aside>
    </div>
  );
}
