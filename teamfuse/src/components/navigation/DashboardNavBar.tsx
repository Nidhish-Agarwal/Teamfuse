import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";
import UserProfileDropdown from "../UserProfileDropdown";

export default function DashboardNavBar() {
  return (
    <nav className="px-6 py-4 border-b border-white/10 bg-[#0f111a]/80 backdrop-blur-md sticky top-0 z-50">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        {/* Left Section */}
        <div className="flex items-center gap-10">
          {/* Logo */}
          <h1 className="text-2xl font-extrabold bg-linear-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            TeamFuse
          </h1>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="hover:bg-white/5 text-white"
          >
            <Settings className="h-5 w-5 text-white/80" />
          </Button>
          <UserProfileDropdown />
        </div>
      </div>
    </nav>
  );
}
