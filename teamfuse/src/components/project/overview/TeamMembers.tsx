/* eslint-disable @next/next/no-img-element */
"use client";

import { Github, ListTodo, MessageSquare } from "lucide-react";
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
        return "bg-green-500";
      case "IDLE":
        return "bg-yellow-500";
      case "FOCUSED":
        return "bg-blue-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <section className="p-6 rounded-2xl bg-gray-900 border border-gray-700">
      <h2 className="text-2xl font-semibold text-white mb-4">Team Members</h2>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {members.map((m) => {
          const liveStatus = presence[m.userId] ?? m.status;

          return (
            <div
              key={m.memberId}
              className="bg-gray-800 p-4 rounded-xl text-center border border-gray-700"
            >
              {/* Avatar */}
              <div className="relative mb-2 h-12 w-12 mx-auto rounded-full overflow-hidden bg-gray-700">
                {m.avatarUrl ? (
                  <img
                    src={m.avatarUrl}
                    alt={m.name}
                    className="h-full w-full object-cover"
                  />
                ) : null}

                {/* Presence Dot */}
                <span
                  className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-gray-800 ${getStatusColor(
                    liveStatus
                  )}`}
                ></span>
              </div>

              <p className="text-lg text-white font-medium">{m.name}</p>
              <p className="text-xs text-gray-400 mb-2 capitalize">
                {m.role.toLowerCase()}
              </p>

              {/* Member Stats (optional values supported) */}
              <div className="flex justify-center gap-3 text-sm text-gray-400">
                <div className="flex items-center gap-1">
                  <Github className="w-4 h-4" />
                  {m.commits ?? 0}
                </div>
                <div className="flex items-center gap-1">
                  <ListTodo className="w-4 h-4" />
                  {m.tasks ?? 0}
                </div>
                <div className="flex items-center gap-1">
                  <MessageSquare className="w-4 h-4" />
                  {m.messages ?? 0}
                </div>
              </div>

              {/* Streak Bar (if provided) */}
              <div className="mt-2 h-1.5 w-full bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-500 transition-all"
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
