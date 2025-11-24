"use client";

import { useEffect, useState } from "react";
import { Clock } from "lucide-react";

interface WorkSummaryData {
  todayMinutes: number; // Use minutes directly
  totalMinutes: number; // Use minutes directly
  todayHours: number;
  totalHours: number;
}

// Utility to convert minutes → h/m format
function formatToday(todayMinutes: number) {
  // Accept minutes directly
  if (todayMinutes < 60) return `${todayMinutes}m`;

  const hrs = Math.floor(todayMinutes / 60);
  const mins = todayMinutes % 60;

  return mins === 0 ? `${hrs}h` : `${hrs}h ${mins}m`;
}

// Utility to convert minutes → d/h/m format
function formatTotal(totalMinutes: number) {
  // Accept minutes directly
  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
  const minutes = totalMinutes % 60;

  if (days > 0) {
    if (hours === 0 && minutes === 0) return `${days}d`;
    if (minutes === 0) return `${days}d ${hours}h`;
    return `${days}d ${hours}h ${minutes}m`;
  }

  if (hours === 0) return `${minutes}m`;
  if (minutes === 0) return `${hours}h`;

  return `${hours}h ${minutes}m`;
}

export default function WorkSummary({ projectId }: { projectId: string }) {
  const [data, setData] = useState<WorkSummaryData | null>(null);

  useEffect(() => {
    if (!projectId) return;

    let mounted = true;

    const loadSummary = async () => {
      try {
        const res = await fetch(`/api/projects/${projectId}/presence/time`);
        const json = await res.json();
        console.log("Work summary API response:", json);

        if (mounted && json.success) {
          setData(json.data as WorkSummaryData);
          console.log("Work summary data set:", json.data);
        }
      } catch (error) {
        console.error("Failed to load work summary:", error);
      }
    };

    loadSummary();
    const intervalId = setInterval(loadSummary, 30000);

    return () => {
      mounted = false;
      clearInterval(intervalId);
    };
  }, [projectId]);

  if (!data) {
    return (
      <div className="p-5 rounded-2xl bg-gradient-to-br from-gray-900/50 to-gray-800/30 border border-gray-700/50 backdrop-blur-sm">
        <div className="flex items-center gap-2 mb-3">
          <Clock className="w-4 h-4 text-purple-400" />
          <h3 className="text-sm text-white font-semibold">Work Summary</h3>
        </div>
        <div className="text-gray-400 text-sm">Loading...</div>
      </div>
    );
  }

  return (
    <div className="p-5 rounded-2xl bg-gradient-to-br from-purple-900/20 via-gray-900/50 to-blue-900/20 border border-purple-500/20 backdrop-blur-sm">
      <div className="flex items-center gap-2 mb-4">
        <div className="p-1.5 bg-purple-500/20 rounded-lg border border-purple-500/30">
          <Clock className="w-4 h-4 text-purple-400" />
        </div>
        <h3 className="text-sm text-white font-semibold">Work Summary</h3>
      </div>

      <div className="space-y-3">
        {/* Today */}
        <div className="flex justify-between items-center p-3 rounded-xl bg-white/5 border border-white/10">
          <span className="text-gray-300 text-sm">Today</span>
          <span className="text-white font-semibold">
            {formatToday(data.todayMinutes)} {/* Use todayMinutes directly */}
          </span>
        </div>

        {/* Total */}
        <div className="flex justify-between items-center p-3 rounded-xl bg-white/5 border border-white/10">
          <span className="text-gray-300 text-sm">Total</span>
          <span className="text-white font-semibold">
            {formatTotal(data.totalMinutes)} {/* Use totalMinutes directly */}
          </span>
        </div>
      </div>
    </div>
  );
}
