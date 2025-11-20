"use client";

import { GitBranch, Link2, Calendar } from "lucide-react";

export default function ProjectHeader({ overview }: any) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl shadow-lg shadow-indigo-500/10">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 text-transparent bg-clip-text">
            {overview.title}
          </h1>
          <p className="text-gray-300 mt-2 max-w-xl">
            {overview.description}
          </p>

          <div className="flex items-center gap-6 mt-4 text-sm text-gray-400">
            <div className="flex items-center gap-2">
              <GitBranch className="h-4 w-4 text-indigo-400" />
              <span>{overview.repoName}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-purple-400" />
              <span>Created {overview.createdAt}</span>
            </div>
          </div>
        </div>

        <a
          href={overview.repoUrl}
          target="_blank"
          className="px-5 py-3 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 shadow-lg shadow-indigo-500/20 text-white font-medium flex items-center gap-2 hover:opacity-90 transition"
        >
          <Link2 className="h-4 w-4" />
          View on GitHub
        </a>
      </div>
    </div>
  );
}
