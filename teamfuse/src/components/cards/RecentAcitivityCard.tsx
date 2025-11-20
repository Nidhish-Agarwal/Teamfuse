import RecentActivityType from "@/lib/interfaces/RecentActivityType";
import { Activity } from "lucide-react";

function RecentAcitivityCard({ activity }: { activity: RecentActivityType }) {
  return (
    <div
      className="
        flex items-start gap-3 
        p-3 
        rounded-xl 
        backdrop-blur-md 
        bg-white/5 
        border border-white/10 
        hover:bg-white/10 
        transition 
        shadow-md shadow-black/10
      "
    >
      {/* Icon Circle */}
      <div
        className="
          p-2 
          rounded-full 
          bg-gradient-to-br 
          from-indigo-500/40 
          to-purple-600/40 
          shadow-md 
          shadow-indigo-500/20
        "
      >
        <Activity className="h-4 w-4 text-indigo-300" />
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-200">
          <span className="font-semibold text-white">{activity.user}</span>{" "}
          <span className="text-gray-300">{activity.action}</span>
        </p>

        <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
      </div>
    </div>
  );
}

export default RecentAcitivityCard;
