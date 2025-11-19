/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useState, useCallback } from "react";
import { usePresence } from "@/hooks/usePresence";
import WorkSummary from "./presence/WorkSummary";
import PomodoroTimer from "./presence/PomodoroTimer";

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

    // Refresh every 60 seconds (reduced from 30)
    const intervalId = setInterval(loadPresence, 60000);

    return () => {
      mounted = false;
      clearInterval(intervalId);
    };
  }, [projectId, loadPresence]);

  // Merge realtime status with member data
  const mergedMembers = members.map((member) => {
    // Try to match by database user ID first, then fall back to any matching
    const realtimeStatus = realtime[member.userId];

    return {
      ...member,
      status: realtimeStatus || member.status,
    };
  });

  const getStatusColor = (status: PresenceRecord["status"]) => {
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
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Team Presence</h3>
        <div className="text-gray-400">Loading presence data...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Team Presence</h3>

      {mergedMembers.length === 0 ? (
        <div className="text-gray-400 text-center py-4">
          No team members online
        </div>
      ) : (
        <ul className="space-y-3">
          {mergedMembers.map((member) => (
            <li
              key={member.userId}
              className="p-3 rounded-lg bg-gray-900 border border-gray-800 flex justify-between items-center"
            >
              <div className="flex items-center gap-3 flex-1">
                <div className="relative">
                  {member.avatarUrl ? (
                    <img
                      src={member.avatarUrl}
                      alt={member.name}
                      className="h-9 w-9 rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-9 w-9 bg-gray-700 rounded-full flex items-center justify-center">
                      <span className="text-xs text-gray-400">
                        {member.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <span
                    className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-gray-900 ${getStatusColor(
                      member.status
                    )}`}
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{member.name}</p>
                  <p className="text-xs text-gray-400 truncate">
                    Active: {formatTime(member.totalActiveMinutes)}
                  </p>
                </div>
              </div>

              <p className="text-xs text-gray-500 whitespace-nowrap ml-2">
                {formatLastActive(member.lastActive)}
              </p>
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
