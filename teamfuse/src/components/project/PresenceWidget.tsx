/* eslint-disable @next/next/no-img-element */
/* eslint-disable react-hooks/purity */
"use client";

import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import { Activity } from "lucide-react";
import { usePresence } from "@/hooks/usePresence";
import WorkSummary from "./presence/WorkSummary";
import PomodoroTimer from "./presence/PomodoroTimer";

interface PresenceMember {
  userId: string;
  name: string;
  avatarUrl: string | null;
  status: "ONLINE" | "IDLE" | "OFFLINE" | "FOCUSED";
  lastActive: string;
  totalActiveMinutes: number;
  todayMinutes: number;
}

interface PresenceWidgetProps {
  projectId: string;
  currentUserId: string;
}

export default function PresenceWidget({
  projectId,
  currentUserId,
}: PresenceWidgetProps) {
  const [members, setMembers] = useState<PresenceMember[]>([]);
  const realtime = usePresence(projectId, currentUserId);
  const initializedRef = useRef(false);

  const loadPresence = useCallback(async () => {
    try {
      const res = await fetch(`/api/projects/${projectId}/presence`);
      const data = await res.json();
      if (!data.success) return;

      const baseMembers: PresenceMember[] = data.data;

      const tRes = await fetch(`/api/projects/${projectId}/presence/time`);
      const tJson = await tRes.json();

      if (tJson.success) {
        const { todayMinutes, totalMinutes } = tJson.data;

        baseMembers.forEach((m) => {
          if (m.userId === currentUserId) {
            m.todayMinutes = todayMinutes;
            m.totalActiveMinutes = totalMinutes;
          }
        });
      }

      setMembers(baseMembers);
    } catch (e) {
      console.error("Presence load failed:", e);
    }
  }, [projectId, currentUserId]);

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    loadPresence();
    const interval = setInterval(loadPresence, 60_000);

    return () => clearInterval(interval);
  }, [loadPresence, projectId, currentUserId]);

  // ✅ FIX: Real-time status updates instantly (same speed as TeamMembers)
  const merged = useMemo(() => {
    return members.map((m) => ({
      ...m,
      status: realtime[m.userId] ?? m.status,
    }));
  }, [members, realtime]);

  const getColor = (status: string) =>
    status === "ONLINE"
      ? "bg-green-400"
      : status === "IDLE"
        ? "bg-yellow-400"
        : status === "FOCUSED"
          ? "bg-blue-400"
          : "bg-gray-500";

  const fmt = (min: number) =>
    min < 60 ? `${min}m` : `${Math.floor(min / 60)}h`;

  const ago = (t: string) => {
    const diff = Math.floor((Date.now() - new Date(t).getTime()) / 60000);
    if (diff < 1) return "just now";
    if (diff < 60) return `${diff}m ago`;
    if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
    return `${Math.floor(diff / 1440)}d ago`;
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold flex items-center gap-2">
        <Activity className="w-5 h-5 text-purple-400" />
        Team Presence
      </h3>

      <ul className="space-y-3">
        {merged.map((m) => (
          <li
            key={m.userId}
            className="p-4 rounded-xl bg-gray-900/40 border border-gray-700"
          >
            <div className="flex items-center gap-3">
              <div className="relative">
                {m.avatarUrl ? (
                  <img
                    className="h-10 w-10 rounded-xl"
                    src={m.avatarUrl}
                    alt={m.name}
                  />
                ) : (
                  <div className="h-10 w-10 rounded-xl bg-gray-700 flex items-center justify-center text-sm text-white">
                    {m.name.charAt(0)}
                  </div>
                )}

                <span
                  className={`absolute -bottom-1 -right-1 h-3.5 w-3.5 rounded-full border-2 border-gray-900 ${getColor(
                    m.status
                  )}`}
                />
              </div>

              <div className="flex-1">
                <p className="text-sm text-white font-semibold">{m.name}</p>
                <p className="text-xs text-gray-300">
                  Active: {fmt(m.totalActiveMinutes)}
                </p>
              </div>

              <p className="text-xs text-gray-500">{ago(m.lastActive)}</p>
            </div>
          </li>
        ))}
      </ul>

      <WorkSummary projectId={projectId} />
      {currentUserId && (
        <PomodoroTimer projectId={projectId} userId={currentUserId} />
      )}
    </div>
  );
}
