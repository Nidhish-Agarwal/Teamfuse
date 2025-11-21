/* eslint-disable @next/next/no-img-element */
"use client";

import { Github, ListTodo, MessageSquare, Users } from "lucide-react";
import { usePresence } from "@/hooks/usePresence";

interface Member {
  memberId: string;
  userId: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  role: string;
  status: string;
  commits?: number;
  tasks?: number;
  messages?: number;
  streak?: number;
}

export default function TeamMembers({
  members,
  projectId,
  currentUserId,
}: {
  members: Member[];
  projectId: string;
  currentUserId: string;
}) {
  const presence = usePresence(projectId, currentUserId);

  const getStatusColor = (status: string | undefined) => {
    switch (status) {
      case "ONLINE":
        return "bg-green-400 shadow-lg shadow-green-400/50";
      case "IDLE":
        return "bg-yellow-400 shadow-lg shadow-yellow-400/50";
      case "FOCUSED":
        return "bg-blue-400 shadow-lg shadow-blue-400/50";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <section className="p-8 rounded-3xl bg-gradient-to-br from-gray-900/50 via-gray-800/30 to-gray-900/50 border border-gray-700/50 backdrop-blur-xl">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white flex items-center gap-3">
          <Users className="w-6 h-6 text-purple-400" />
          Team Members
        </h2>
        <span className="px-4 py-1.5 bg-purple-500/20 border border-purple-500/30 rounded-full text-purple-300 text-sm font-medium">
          {members.length} Active
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {members.map((m) => {
          const liveStatus = presence[m.userId] ?? m.status;

          return (
            <div
              key={m.memberId}
              className="relative p-5 rounded-2xl bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700/50 hover:border-purple-500/30 hover:shadow-lg hover:shadow-purple-500/10 transition-all backdrop-blur-sm"
            >
              {/* Avatar */}
              <div className="relative mb-3 h-16 w-16 mx-auto rounded-2xl overflow-hidden bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-white/10">
                {m.avatarUrl ? (
                  <img
                    src={m.avatarUrl}
                    alt={m.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-2xl font-bold text-white">
                    {m.name.charAt(0).toUpperCase()}
                  </div>
                )}

                {/* Presence Dot */}
                <span
                  className={`absolute bottom-1 right-1 h-3.5 w-3.5 rounded-full border-2 border-gray-900 ${getStatusColor(
                    liveStatus
                  )}`}
                ></span>
              </div>

              <p className="text-base text-white font-semibold text-center">
                {m.name}
              </p>
              <p className="text-xs text-gray-400 mb-3 capitalize text-center">
                {m.role.toLowerCase()}
              </p>

              {/* Member Stats */}
              <div className="flex justify-center gap-3 text-sm text-gray-400 mb-3">
                <div className="flex items-center gap-1">
                  <Github className="w-4 h-4 text-emerald-400" />
                  <span className="text-white font-medium">
                    {m.commits ?? 0}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <ListTodo className="w-4 h-4 text-cyan-400" />
                  <span className="text-white font-medium">{m.tasks ?? 0}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MessageSquare className="w-4 h-4 text-pink-400" />
                  <span className="text-white font-medium">
                    {m.messages ?? 0}
                  </span>
                </div>
              </div>

              {/* Streak Bar */}
              <div className="mt-3 h-2 w-full bg-gray-700/50 rounded-full overflow-hidden border border-gray-600/30">
                <div
                  className="h-full bg-gradient-to-r from-green-500 to-emerald-400 transition-all shadow-lg shadow-green-500/30"
                  style={{ width: `${Math.min(m.streak ?? 0, 7) * 15}%` }}
                ></div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
