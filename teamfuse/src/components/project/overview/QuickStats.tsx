/* eslint-disable @typescript-eslint/no-explicit-any */
import { Code2, ListTodo, MessageCircle } from "lucide-react";

export default function QuickStats({ stats }: { stats: any }) {
  if (!stats) return null;

  const { tasks, github, messages } = stats;

  const statCards = [
    {
      icon: ListTodo,
      label: "Active Tasks",
      value: tasks?.total ?? 0,
      gradient: "from-blue-500/20 to-cyan-500/20",
      iconColor: "text-cyan-400",
      borderColor: "border-cyan-500/30",
    },
    {
      icon: Code2,
      label: "Total Commits",
      value: github?.commitCount ?? 0,
      gradient: "from-green-500/20 to-emerald-500/20",
      iconColor: "text-emerald-400",
      borderColor: "border-emerald-500/30",
    },
    {
      icon: MessageCircle,
      label: "Messages",
      value: messages ?? 0,
      gradient: "from-purple-500/20 to-pink-500/20",
      iconColor: "text-pink-400",
      borderColor: "border-pink-500/30",
    },
  ];

  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {statCards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className={`relative p-6 rounded-2xl bg-gradient-to-br ${card.gradient} backdrop-blur-xl border ${card.borderColor} hover:scale-105 transition-transform`}
          >
            <div className="flex items-center gap-4">
              <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                <Icon className={`w-7 h-7 ${card.iconColor}`} />
              </div>
              <div>
                <p className="text-gray-400 text-sm font-medium">
                  {card.label}
                </p>
                <h2 className="text-3xl font-bold text-white mt-1">
                  {card.value}
                </h2>
              </div>
            </div>
          </div>
        );
      })}
    </section>
  );
}
