"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Settings, LogOut, User, Loader2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { logout } from "@/lib/auth/logout";

export default function UserProfileDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const session = useSession();
  const user = session.data?.user;

  const initials = user?.name
    ?.split(" ")
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const handleLogout = async () => {
    setLoading(true);
    await logout();
  };

  return (
    <div
      className="relative"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      {/* Avatar Trigger */}
      <Avatar className="border border-white/20 shadow-md shadow-indigo-500/20 cursor-pointer hover:border-indigo-400/40 transition-colors">
        <AvatarImage src={user?.image || "https://github.com/shadcn.png"} />
        <AvatarFallback className="bg-linear-to-br from-indigo-500 to-purple-600 text-white">
          {initials}
        </AvatarFallback>
      </Avatar>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-[#0f111a]/95 backdrop-blur-xl border border-white/10 rounded-lg shadow-2xl shadow-indigo-500/10 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          {/* User Info Section */}
          <div className="p-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12 border border-white/20">
                <AvatarImage
                  src={user?.image || "https://github.com/shadcn.png"}
                />
                <AvatarFallback className="bg-linear-to-br from-indigo-500 to-purple-600 text-white">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">
                  {user?.name || "You"}
                </p>
                <p className="text-xs text-white/60 truncate">
                  {user?.email || "NA"}
                </p>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="p-2">
            <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-white/80 hover:bg-white/5 hover:text-white rounded-md transition-colors">
              <User className="h-4 w-4" />
              View Profile
            </button>

            <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-white/80 hover:bg-white/5 hover:text-white rounded-md transition-colors">
              <Settings className="h-4 w-4" />
              Settings
            </button>
          </div>

          {/* Logout Section */}
          <div className="p-2 border-t border-white/10">
            <button
              disabled={loading}
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-md transition-colors"
            >
              <LogOut className="h-4 w-4" />
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Logging out...
                </>
              ) : (
                "Logout"
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
