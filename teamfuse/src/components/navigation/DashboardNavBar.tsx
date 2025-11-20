import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Bell, Settings } from "lucide-react";

export default function DashboardNavBar() {
  return (
    <nav className="px-6 py-4 border-b border-white/10 bg-[#0f111a]/80 backdrop-blur-md sticky top-0 z-50">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        
        {/* Left Section */}
        <div className="flex items-center gap-10">
          {/* Logo */}
          <h1 className="text-2xl font-extrabold bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            TeamFuse
          </h1>

          {/* Nav Items */}
          <div className="hidden md:flex gap-6">
            <button className="text-sm font-medium text-white/70 hover:text-white transition">
              Dashboard
            </button>
            <button className="text-sm text-white/60 hover:text-white transition">
              Projects
            </button>
            <button className="text-sm text-white/60 hover:text-white transition">
              Insights
            </button>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="hover:bg-white/5 text-white"
          >
            <Bell className="h-5 w-5 text-white/80" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="hover:bg-white/5 text-white"
          >
            <Settings className="h-5 w-5 text-white/80" />
          </Button>

          <Avatar className="border border-white/20 shadow-md shadow-indigo-500/20">
            <AvatarImage src="https://github.com/shadcn.png" />
            <AvatarFallback>ME</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </nav>
  );
}
