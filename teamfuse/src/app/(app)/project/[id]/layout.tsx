import Sidebar from "@/components/project/Sidebar";
import PresenceWidget from "@/components/project/PresenceWidget";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

interface LayoutProps {
  children: React.ReactNode;
  params: { id: string };
}

export default async function ProjectLayout({ children, params }: LayoutProps) {
  const { id: projectId } = await params;

  const session = await getServerSession(authOptions);
  const currentUserId = session?.user?.id;

  return (
    <div className="flex min-h-screen bg-gray-950 text-white">
      {/* LEFT SIDEBAR */}
      <Sidebar projectId={projectId} userId={currentUserId} />

      {/* MAIN CONTENT — NO SCROLL */}
      <main className="flex-1 overflow-visible">{children}</main>

      {/* RIGHT PRESENCE SIDEBAR — NO SCROLL */}
      <aside className="hidden xl:block w-80 border-l border-gray-800 p-4 overflow-visible">
        <PresenceWidget
          projectId={projectId}
          currentUserId={currentUserId ?? ""}
        />
      </aside>
    </div>
  );
}
