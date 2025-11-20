import PresenceWidget from "@/components/project/PresenceWidget";
import ProjectSidebar from "@/components/project/Sidebar";

export default function ProjectLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-gradient-to-br from-[#0f111a] via-[#141620] to-[#1a1c25] text-white overflow-hidden">

      <ProjectSidebar />

      <div className="flex-1 overflow-y-auto px-8 py-6">
        {children}
      </div>

      <aside className="hidden lg:block w-72 border-l border-white/10 bg-white/5 backdrop-blur-xl p-6 shadow-2xl shadow-indigo-500/10">
        <PresenceWidget projectId={"replace-with-dynamic-id"} />
      </aside>
    </div>
  );
}
