"use client";

import { Circle } from "lucide-react";

export default function TeamMembers({ members, projectId, currentUserId }: any) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl shadow shadow-purple-500/10">
      <h2 className="text-xl font-bold text-white mb-4">Team Members</h2>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {members.map((m: any) => (
          <div
            key={m.id}
            className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition"
          >
            <div className="flex items-center gap-3">
              <img
                src={m.avatar}
                className="h-10 w-10 rounded-full border border-white/20"
              />
              <div>
                <p className="text-white font-medium">{m.name}</p>
                <p className="text-xs text-gray-400">{m.role}</p>
              </div>
            </div>

            <Circle
              className={`h-3 w-3 ${
                m.status === "online"
                  ? "text-green-400"
                  : m.status === "idle"
                  ? "text-yellow-400"
                  : "text-red-500"
              }`}
              fill="currentColor"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
