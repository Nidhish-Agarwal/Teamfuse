/* eslint-disable @typescript-eslint/no-explicit-any */
import { Sparkles } from "lucide-react";

export default function AISummary({ insight }: { insight: any }) {
  if (!insight) {
    return (
      <section className="relative p-8 rounded-3xl bg-gradient-to-br from-gray-900/50 via-gray-800/30 to-gray-900/50 border border-gray-700/50 backdrop-blur-xl overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-purple-500/5 rounded-full blur-3xl"></div>
        <div className="relative z-10 flex items-center gap-3 mb-4">
          <div className="p-2 bg-purple-500/20 rounded-xl border border-purple-500/30">
            <Sparkles className="w-5 h-5 text-purple-400" />
          </div>
          <h2 className="text-xl font-bold text-white">AI Summary</h2>
        </div>
        <p className="text-gray-400 relative z-10">
          No AI summary generated yet.
        </p>
      </section>
    );
  }

  return (
    <section className="relative p-8 rounded-3xl bg-gradient-to-br from-purple-900/20 via-gray-900/50 to-blue-900/20 border border-purple-500/30 backdrop-blur-xl overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl"></div>

      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-gradient-to-br from-purple-500/30 to-blue-500/30 rounded-xl border border-purple-500/30 shadow-lg shadow-purple-500/20">
            <Sparkles className="w-5 h-5 text-purple-300" />
          </div>
          <h2 className="text-xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
            AI Summary
          </h2>
        </div>
        <p className="text-gray-300 leading-relaxed">{insight.summary}</p>
      </div>
    </section>
  );
}
