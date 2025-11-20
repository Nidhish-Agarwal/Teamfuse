import Sidebar from "@/components/project/Sidebar";
import PresenceWidget from "@/components/project/PresenceWidget";
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

  return (
    <div className="flex h-screen bg-gray-950 text-white">
      {/* LEFT SIDEBAR */}
      <Sidebar projectId={projectId} />

      {/* MAIN CONTENT */}
      <main className="flex-1 overflow-auto">{children}</main>

      {/* RIGHT PRESENCE SIDEBAR */}
      <aside className="hidden xl:block w-80 border-l border-gray-800 p-4 overflow-y-auto">
        <PresenceWidget projectId={projectId} currentUserId={currentUserId} />
      </aside>
    </div>
  );
}
