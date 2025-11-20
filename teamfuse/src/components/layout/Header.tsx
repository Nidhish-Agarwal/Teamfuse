"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell } from "lucide-react";

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="
      w-full 
      fixed top-0 z-50
      border-b border-white/10 
      bg-[#0e0f17]/70 
      backdrop-blur-xl 
      shadow-lg shadow-black/20
    ">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        
        {/* Logo */}
        <Link
          href="/dashboard"
          className="text-xl font-extrabold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent"
        >
          TeamFuse
        </Link>

        {/* Nav */}
        <nav className="hidden gap-6 md:flex">
          {[{ href: "/dashboard", label: "Dashboard" }].map((i) => (
            <Link
              key={i.href}
              href={i.href}
              className={`text-sm tracking-wide transition ${
                pathname === i.href
                  ? "text-white font-semibold"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              {i.label}
            </Link>
          ))}
        </nav>

        {/* Right Icons */}
        <div className="flex items-center gap-4">
          <button
            className="
              p-2 rounded-xl 
              hover:bg-white/10 
              transition
              text-gray-300 hover:text-white
            "
          >
            <Bell className="h-5 w-5" />
          </button>

          {/* Avatar */}
          <button className="
            px-3 py-1.5 
            rounded-full 
            bg-gradient-to-br from-indigo-600 to-purple-600 
            text-white font-medium
            shadow-md shadow-indigo-500/30
            hover:shadow-indigo-500/50
            transition
          ">
            ME
          </button>
        </div>
      </div>
    </header>
  );
}
