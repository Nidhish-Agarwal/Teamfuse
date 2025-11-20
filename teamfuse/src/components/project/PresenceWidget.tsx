"use client";

import { Clock } from "lucide-react";

export default function PresenceWidget({ projectId }: any) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl backdrop-blur-xl p-6 shadow shadow-indigo-500/10">
      <h2 className="text-lg font-bold text-white">Live Presence</h2>

      <div className="mt-4 space-y-3">
        {[
          { name: "Arjun", status: "online", time: "Active now" },
          { name: "Varsha", status: "idle", time: "Idle 10m" },
          { name: "Ravi", status: "offline", time: "Last seen 1h" },
        ].map((u, i) => (
          <div
            key={i}
            className="flex justify-between items-center bg-white/5 border border-white/10 p-3 rounded-xl"
          >
            <span className="text-white font-medium">{u.name}</span>
            <span
              className={`text-xs ${
                u.status === "online"
                  ? "text-green-400"
                  : u.status === "idle"
                  ? "text-yellow-400"
                  : "text-red-400"
              }`}
            >
              {u.time}
            </span>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2 text-gray-400 text-xs mt-4">
        <Clock className="h-4 w-4" />
        Active session tracking enabled
      </div>
    </div>
  );
}
