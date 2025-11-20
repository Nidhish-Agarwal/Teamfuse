"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const LINKS = [
  { href: "/dashboard", label: "Overview" },
  { href: "/project/123/chat", label: "Chat Space" },
  { href: "/project/123/tasks", label: "Task Space" },
  { href: "/project/123/github", label: "GitHub Insights" },
  { href: "/project/123/team-performance", label: "Team Performance" },
  { href: "/me/performance", label: "My Performance" },
  { href: "/project/123/feedback", label: "Peer Feedback" },
  { href: "/settings", label: "Settings" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        className="
          m-3 rounded-lg bg-white/10 px-4 py-2 text-sm text-white 
          shadow hover:bg-white/20 md:hidden backdrop-blur-lg
        "
        onClick={() => setOpen(true)}
      >
        ☰ Menu
      </button>

      {/* Mobile Drawer */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
          onClick={() => setOpen(false)}
        >
          <aside
            className="
              absolute left-0 top-0 h-full w-72 p-5 
              bg-[#11121b]/90 border-r border-white/10 shadow-xl 
              backdrop-blur-xl
            "
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="mb-4 text-sm font-semibold text-gray-300">
              Navigation
            </h2>

            <ul className="space-y-2">
              {LINKS.map((i) => (
                <li key={i.href}>
                  <Link
                    href={i.href}
                    onClick={() => setOpen(false)}
                    className={`
                      block rounded-lg px-3 py-2 text-sm transition 
                      ${
                        pathname === i.href
                          ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-purple-500/30"
                          : "text-gray-300 hover:bg-white/10"
                      }
                    `}
                  >
                    {i.label}
                  </Link>
                </li>
              ))}
            </ul>
          </aside>
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside
        className="
          sticky top-[72px] hidden md:block
          h-[calc(100vh-72px)] w-64 shrink-0 
          bg-[#0f1018]/60 border-r border-white/10
          backdrop-blur-xl p-5 shadow-lg shadow-black/20
        "
      >
        <ul className="space-y-2">
          {LINKS.map((i) => (
            <li key={i.href}>
              <Link
                href={i.href}
                className={`
                  block rounded-lg px-3 py-2 text-sm transition
                  ${
                    pathname === i.href
                      ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-500/30"
                      : "text-gray-300 hover:bg-white/10"
                  }
                `}
              >
                {i.label}
              </Link>
            </li>
          ))}
        </ul>
      </aside>
    </>
  );
}
