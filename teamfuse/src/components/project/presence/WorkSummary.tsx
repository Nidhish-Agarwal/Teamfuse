"use client";

import { useEffect, useState } from "react";
import { Clock } from "lucide-react";

interface WorkSummaryData {
  todayHours: number;
  totalHours: number;
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
        if (mounted && json.success) {
          setData(json.data as WorkSummaryData);
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
        <div className="flex justify-between items-center p-3 rounded-xl bg-white/5 border border-white/10">
          <span className="text-gray-300 text-sm">Today</span>
          <span className="text-white font-semibold">
            {data.todayHours.toFixed(1)} hrs
          </span>
        </div>

        <div className="flex justify-between items-center p-3 rounded-xl bg-white/5 border border-white/10">
          <span className="text-gray-300 text-sm">Total</span>
          <span className="text-white font-semibold">
            {data.totalHours.toFixed(1)} hrs
          </span>
        </div>
      </div>
    </div>
  );
}
