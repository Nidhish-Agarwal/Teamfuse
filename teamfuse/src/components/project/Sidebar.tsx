"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Sidebar({ projectId }: { projectId: string }) {
  const pathname = usePathname();

  const links = [
    { label: "Overview", href: `/project/${projectId}/overview` },
    { label: "Tasks", href: `/project/${projectId}/tasks` },
    { label: "GitHub", href: `/project/${projectId}/github` },
    { label: "Chat", href: `/project/${projectId}/chat` },
    { label: "Team Performance", href: `/project/${projectId}/team-performance` },
  ];

  return (
    <aside className="w-64 border-r border-gray-800 p-6 hidden md:block">
      <nav className="space-y-3">
        {links.map(({ label, href }) => (
          <Link
            key={href}
            href={href}
            className={`block px-3 py-2 rounded transition-colors ${
              pathname === href
                ? "bg-gray-800 text-blue-400"
                : "hover:bg-gray-800 hover:text-blue-400"
            }`}
          >
            {label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
