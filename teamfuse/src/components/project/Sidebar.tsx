"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { label: "Overview", path: "overview" },
  { label: "Chat Space", path: "chat" },
  { label: "Task Space", path: "tasks" },
  { label: "GitHub Insights", path: "github" },
  { label: "Team Performance", path: "team-performance" },
  { label: "Peer Feedback", path: "feedback" },
];

export default function ProjectSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 h-full bg-white/5 border-r border-white/10 backdrop-blur-xl p-6 hidden lg:flex flex-col gap-1">
      {LINKS.map((link) => {
        const active = pathname.includes(link.path);
        return (
          <Link
            key={link.path}
            href={pathname.replace(/(overview|chat|tasks|github|team-performance|feedback)/, link.path)}
            className={`px-4 py-2 rounded-lg text-sm transition ${
              active
                ? "bg-indigo-600/30 text-white border border-indigo-500/50"
                : "text-gray-300 hover:bg-white/10"
            }`}
          >
            {link.label}
          </Link>
        );
      })}
    </aside>
  );
}
