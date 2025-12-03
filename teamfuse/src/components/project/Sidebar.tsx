"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ListTodo,
  Github,
  MessageCircle,
  Users,
  Settings2,
} from "lucide-react";
import { fetchMember } from "./actions";

export default function Sidebar({
  projectId,
  userId,
}: {
  projectId: string;
  userId: string | undefined;
}) {
  const pathname = usePathname();

  const [role, setRole] = useState<string | null>(null);

  // Load member details on mount
  useEffect(() => {
    async function load() {
      if (!userId) return; // Session not ready
      const member = await fetchMember(projectId, userId);
      setRole(member?.role ?? null);
    }
    load();
  }, [userId, projectId]);

  // While session is loading
  if (status === "loading") {
    return (
      <aside className="w-64 p-6 hidden md:block">
        <p className="text-gray-400">Loading...</p>
      </aside>
    );
  }

  // If user is not logged in
  if (!userId) {
    return (
      <aside className="w-64 p-6 hidden md:block">
        <p className="text-red-400">You are not logged in.</p>
      </aside>
    );
  }

  const links = [
    {
      label: "Overview",
      href: `/project/${projectId}/overview`,
      icon: LayoutDashboard,
    },
    {
      label: "Tasks",
      href: `/project/${projectId}/tasks`,
      icon: ListTodo,
    },
    {
      label: "GitHub",
      href: `/project/${projectId}/github`,
      icon: Github,
    },
    {
      label: "Chat",
      href: `/project/${projectId}/chat`,
      icon: MessageCircle,
    },
    {
      label: "Team Performance",
      href: `/project/${projectId}/team-performance`,
      icon: Users,
    },
  ];

  // Add manage tab ONLY for leaders
  if (role === "LEADER" || role === "ADMIN") {
    links.push({
      label: "Manage",
      href: `/project/${projectId}/manage`,
      icon: Settings2,
    });
  }

  return (
    <aside className="w-64 border-r border-gray-800/50 p-6 hidden md:block bg-gradient-to-b from-gray-900/50 to-gray-950/50 backdrop-blur-xl">
      <div className="mb-8">
        <Link href={"/dashboard"}>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            Dashboard
          </h2>
        </Link>
      </div>

      <nav className="space-y-2">
        {links.map(({ label, href, icon: Icon }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`group flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                isActive
                  ? "bg-gradient-to-r from-purple-600/20 to-blue-600/20 text-purple-300 border border-purple-500/30 shadow-lg shadow-purple-500/10"
                  : "hover:bg-gray-800/50 text-gray-400 hover:text-white border border-transparent"
              }`}
            >
              <Icon
                className={`w-5 h-5 ${isActive ? "text-purple-400" : "group-hover:text-purple-400"} transition-colors`}
              />
              <span className="font-medium">{label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
