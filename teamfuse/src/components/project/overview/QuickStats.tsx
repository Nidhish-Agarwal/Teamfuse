"use client";

import { GitCommit, ListChecks, MessageSquare } from "lucide-react";

export default function QuickStats({ stats }: any) {
  const items = [
    {
      icon: GitCommit,
      label: "Total Commits",
      value: stats.totalCommits,
      color: "text-indigo-400",
    },
    {
      icon: ListChecks,
      label: "Active Tasks",
      value: stats.activeTasks,
      color: "text-purple-400",
    },
    {
      icon: MessageSquare,
      label: "Messages Sent",
      value: stats.messages,
      color: "text-pink-400",
    },
  ];

  return (
    <div className="grid md:grid-cols-3 gap-6">
      {items.map((i, index) => {
        const Icon = i.icon;
        return (
          <div
            key={index}
            className="p-6 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-xl shadow shadow-indigo-500/10 flex flex-col gap-2"
          >
            <Icon className={`h-6 w-6 ${i.color}`} />
            <p className="text-sm text-gray-400">{i.label}</p>
            <p className="text-3xl font-bold text-white">{i.value}</p>
          </div>
        );
      })}
    </div>
  );
}
