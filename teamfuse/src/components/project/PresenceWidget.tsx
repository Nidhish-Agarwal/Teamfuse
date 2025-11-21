/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useState, useCallback } from "react";
import { usePresence } from "@/hooks/usePresence";
import WorkSummary from "./presence/WorkSummary";
import PomodoroTimer from "./presence/PomodoroTimer";
import { Activity } from "lucide-react";

interface PresenceRecord {
  userId: string;
  name: string;
  avatarUrl: string | null;
  status: "ONLINE" | "IDLE" | "OFFLINE" | "FOCUSED";
  totalActiveMinutes: number;
  lastActive: string;
}

interface Props {
  projectId: string;
  currentUserId: string | null;
}

export default function PresenceWidget({ projectId, currentUserId }: Props) {
  const [members, setMembers] = useState<PresenceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const realtime = usePresence(projectId, currentUserId ?? "");

  const loadPresence = useCallback(async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}/presence`);
      const data = await response.json();
      if (data.success) {
        setMembers(data.data as PresenceRecord[]);
      }
    } catch (error) {
      console.error("Failed to load presence:", error);
    }
  }, [projectId]);

  useEffect(() => {
    if (!projectId) return;

    let mounted = true;

    const load = async () => {
      setIsLoading(true);
      await loadPresence();
      if (mounted) setIsLoading(false);
    };

    load();
    const intervalId = setInterval(loadPresence, 60000);

    return () => {
      mounted = false;
      clearInterval(intervalId);
    };
  }, [projectId, loadPresence]);

  const mergedMembers = members.map((member) => {
    const realtimeStatus = realtime[member.userId];
    return {
      ...member,
      status: realtimeStatus || member.status,
    };
  });

  const getStatusColor = (status: PresenceRecord["status"]) => {
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

  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  const formatLastActive = (lastActive: string) => {
    const now = new Date().getTime();
    const lastActiveTime = new Date(lastActive).getTime();
    const diffInMinutes = Math.floor((now - lastActiveTime) / (1000 * 60));

    if (diffInMinutes < 1) return "just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  if (isLoading) {
    return (
      <div className="space-y-4 p-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Activity className="w-5 h-5 text-purple-400" />
          Team Presence
        </h3>
        <div className="text-gray-400">Loading presence data...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold flex items-center gap-2">
        <Activity className="w-5 h-5 text-purple-400" />
        Team Presence
      </h3>

      {mergedMembers.length === 0 ? (
        <div className="text-gray-400 text-center py-4 p-4 rounded-2xl bg-gray-900/50 border border-gray-800">
          No team members online
        </div>
      ) : (
        <ul className="space-y-3">
          {mergedMembers.map((member) => (
            <li
              key={member.userId}
              className="p-4 rounded-2xl bg-gradient-to-br from-gray-900/50 to-gray-800/30 border border-gray-700/50 hover:border-purple-500/30 transition-all backdrop-blur-sm"
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  {member.avatarUrl ? (
                    <img
                      src={member.avatarUrl}
                      alt={member.name}
                      className="h-10 w-10 rounded-xl object-cover border border-gray-700"
                    />
                  ) : (
                    <div className="h-10 w-10 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-xl flex items-center justify-center border border-gray-700">
                      <span className="text-sm font-bold text-white">
                        {member.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <span
                    className={`absolute -bottom-1 -right-1 h-3.5 w-3.5 rounded-full border-2 border-gray-900 ${getStatusColor(
                      member.status
                    )}`}
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">
                    {member.name}
                  </p>
                  <p className="text-xs text-gray-400 truncate">
                    Active: {formatTime(member.totalActiveMinutes)}
                  </p>
                </div>

                <p className="text-xs text-gray-500 whitespace-nowrap">
                  {formatLastActive(member.lastActive)}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}

      <WorkSummary projectId={projectId} />

      {currentUserId && (
        <PomodoroTimer projectId={projectId} userId={currentUserId} />
      )}
    </div>
  );
}
