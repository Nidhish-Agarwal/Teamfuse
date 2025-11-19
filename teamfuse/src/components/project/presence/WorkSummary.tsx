"use client";

import { useEffect, useState } from "react";

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

    const intervalId = setInterval(loadSummary, 30000); // Refresh every 30 seconds

    return () => {
      mounted = false;
      clearInterval(intervalId);
    };
  }, [projectId]);

  if (!data) {
    return (
      <div className="bg-gray-900 border border-gray-800 p-4 rounded-xl">
        <h3 className="text-sm text-white mb-2 font-semibold">Work Summary</h3>
        <div className="text-gray-400 text-sm">Loading...</div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 border border-gray-800 p-4 rounded-xl">
      <h3 className="text-sm text-white mb-2 font-semibold">Work Summary</h3>

      <div className="space-y-2">
        <div className="flex justify-between text-gray-300 text-sm">
          <span>Today</span>
          <span className="text-white">{data.todayHours.toFixed(1)} hrs</span>
        </div>

        <div className="flex justify-between text-gray-300 text-sm">
          <span>Total</span>
          <span className="text-white">{data.totalHours.toFixed(1)} hrs</span>
        </div>
      </div>
    </div>
  );
}
