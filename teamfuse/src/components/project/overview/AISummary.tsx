"use client";

import { Sparkles } from "lucide-react";

export default function AISummary({ overview }: any) {
  return (
    <div className="p-6 bg-gradient-to-br from-indigo-600/20 to-purple-700/20 border border-white/10 rounded-2xl backdrop-blur-xl shadow-lg shadow-indigo-500/20">
      <div className="flex items-start gap-3">
        <Sparkles className="h-6 w-6 text-indigo-300" />
        <div>
          <h3 className="text-xl font-bold text-white">AI Summary</h3>
          <p className="text-gray-300 mt-2 leading-relaxed">
            {overview.aiSummary}
          </p>
        </div>
      </div>
    </div>
  );
}
