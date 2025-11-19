/* eslint-disable @typescript-eslint/no-explicit-any */

import { Code2, ListTodo, MessageCircle } from "lucide-react";

export default function QuickStats({ stats }: { stats: any }) {
  if (!stats) return null;

  const { tasks, github, messages } = stats;

  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {/* === Tasks === */}
      <div className="p-5 bg-gray-900 rounded-xl border border-gray-800 flex items-center gap-4">
        <div className="p-3 bg-blue-600/20 rounded-lg">
          <ListTodo className="w-6 h-6 text-blue-400" />
        </div>
        <div>
          <p className="text-gray-400 text-sm">Active Tasks</p>
          <h2 className="text-2xl font-bold text-white">{tasks?.total ?? 0}</h2>
        </div>
      </div>

      {/* === Commits === */}
      <div className="p-5 bg-gray-900 rounded-xl border border-gray-800 flex items-center gap-4">
        <div className="p-3 bg-green-600/20 rounded-lg">
          <Code2 className="w-6 h-6 text-green-400" />
        </div>
        <div>
          <p className="text-gray-400 text-sm">Commits</p>
          <h2 className="text-2xl font-bold text-white">
            {github?.commitCount ?? 0}
          </h2>
        </div>
      </div>

      {/* === Messages === */}
      <div className="p-5 bg-gray-900 rounded-xl border border-gray-800 flex items-center gap-4">
        <div className="p-3 bg-purple-600/20 rounded-lg">
          <MessageCircle className="w-6 h-6 text-purple-400" />
        </div>
        <div>
          <p className="text-gray-400 text-sm">Messages Sent</p>
          <h2 className="text-2xl font-bold text-white">{messages ?? 0}</h2>
        </div>
      </div>
    </section>
  );
}
