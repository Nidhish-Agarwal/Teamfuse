"use client";

import { usePresence } from "@/hooks/usePresence";

interface TeamMember {
  userId: string;
  name: string;
  avatarUrl: string;
  role: string;
  status: string; // This should be presence status, not membership status
}

export default function TeamMembers({
  members,
  projectId,
  currentUserId,
}: {
  members: TeamMember[];
  projectId: string;
  currentUserId: string;
}) {
  const live = usePresence(projectId, currentUserId);

  const color = (s: string) =>
    s === "ONLINE"
      ? "bg-green-400"
      : s === "IDLE"
        ? "bg-yellow-400"
        : s === "FOCUSED"
          ? "bg-blue-400"
          : "bg-gray-500";

  // console.log("Real-time presence data:", live);
  // console.log("Team members data:", members);

  return (
    <section>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {members.map((m) => {
          // Get the real-time status
          const realTimeStatus = live[m.userId];

          // For users without real-time data, default to OFFLINE
          const displayStatus = realTimeStatus ?? "OFFLINE";

          // console.log(`User ${m.name}: Live=${realTimeStatus}, Display=${displayStatus}`);

          return (
            <div key={m.userId} className="text-center">
              <div className="relative h-16 w-16 mx-auto mb-2">
                <img
                  src={m.avatarUrl ?? ""}
                  className="h-full w-full object-cover rounded-xl"
                  alt={m.name}
                />
                <span
                  className={`absolute bottom-1 right-1 h-3.5 w-3.5 rounded-full border-2 border-white ${color(displayStatus)}`}
                />
              </div>
              <p className="font-semibold text-sm">{m.name}</p>
              <p className="text-xs text-gray-500 capitalize">
                {displayStatus.toLowerCase()}
              </p>
              <p className="text-xs text-gray-400">{m.role}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
