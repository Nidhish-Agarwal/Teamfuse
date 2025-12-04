"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  BarChart,
  Bar,
  Legend,
} from "recharts";

// NEW imports
import ErrorUnauthorized from "@/components/shared/ErrorUnauthorized";
import ErrorNoAccess from "@/components/shared/ErrorNoAccess";
import ErrorProjectNotFound from "@/components/shared/ErrorProjectNotFound";

// ---------------- TYPES ----------------

interface GithubEntry {
  weekStart: string;
  commitCount: number;
  prCount: number;
}

interface PeerBenchmark {
  userRate: number;
  teamRate: number;
}

interface PerformanceResponse {
  taskCompletionRate: number;
  avgFeedback: number | null;
  chatParticipationScore: number;
  github: GithubEntry[];
  prCount: number;
  peerBenchmark: PeerBenchmark;
}

export default function ProjectPerformancePage() {
  const { id: projectId } = useParams();
  const [data, setData] = useState<PerformanceResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // NEW local state for errors
  const [unauthorized, setUnauthorized] = useState(false);
  const [noAccess, setNoAccess] = useState(false);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!projectId) return;

    fetch(`/api/projects/${projectId}/performance`)
      .then((res) => {
        if (res.status === 401) {
          setUnauthorized(true);
          setLoading(false);
          return null;
        }
        if (res.status === 403) {
          setNoAccess(true);
          setLoading(false);
          return null;
        }
        if (res.status === 404) {
          setNotFound(true);
          setLoading(false);
          return null;
        }
        return res.json();
      })
      .then((res) => {
        if (!res) return;
        setData(res.data as PerformanceResponse);
        setLoading(false);
      });
  }, [projectId]);

  // NEW — Show correct UI screen instead of a spinner when access denied
  if (unauthorized) return <ErrorUnauthorized />;
  if (noAccess) return <ErrorNoAccess />;
  if (notFound) return <ErrorProjectNotFound />;

  if (loading || !data) {
    return (
      <div className="p-10 flex justify-center items-center h-[80vh] text-gray-400">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading performance data...</p>
        </div>
      </div>
    );
  }

  const githubData = Array.isArray(data.github) ? data.github : [];

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto text-white">
      {/* HEADER - Enhanced */}
      <div className="space-y-3 mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-blue-400 to-purple-400 text-transparent bg-clip-text">
              Performance Dashboard
            </h1>
            <p className="text-gray-300 mt-2">
              Track your contribution insights and metrics for this project
            </p>
          </div>
        </div>
        <div className="h-px bg-gradient-to-r from-transparent via-purple-500/30 to-transparent" />
      </div>

      {/* METRICS - Enhanced with icons and better spacing */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Task Completion Card */}
        <Card className="bg-gradient-to-br from-[#0d0f1a] to-[#14172a] border border-blue-500/20 rounded-2xl shadow-xl hover:shadow-blue-500/10 transition-all duration-300">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-gray-300 text-lg">
                Task Completion
              </CardTitle>
              <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <div className="w-6 h-6 bg-blue-400 rounded-full" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-bold text-blue-400">
                {data.taskCompletionRate}%
              </span>
              <div className="ml-auto">
                <div className="w-32 h-2 bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full"
                    style={{ width: `${data.taskCompletionRate}%` }}
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1">of total tasks</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Avg Feedback */}
        <Card className="bg-gradient-to-br from-[#0d0f1a] to-[#14172a] border border-purple-500/20 rounded-2xl shadow-xl hover:shadow-purple-500/10 transition-all duration-300">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-gray-300 text-lg">
                Avg Feedback
              </CardTitle>
              <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                <div className="w-6 h-6 bg-purple-400 rounded-full" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-bold text-purple-400">
                {data.avgFeedback?.toFixed(1) ?? "0.0"}
              </span>
              <span className="text-lg text-gray-400">/ 5</span>
              <div className="ml-auto">
                <div className="w-32 h-2 bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-400 to-purple-600 rounded-full"
                    style={{ width: `${(data.avgFeedback || 0) * 20}%` }}
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1">quality score</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Chat Score */}
        <Card className="bg-gradient-to-br from-[#0d0f1a] to-[#14172a] border border-pink-500/20 rounded-2xl shadow-xl hover:shadow-pink-500/10 transition-all duration-300">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-gray-300 text-lg">
                Chat Score
              </CardTitle>
              <div className="w-10 h-10 rounded-lg bg-pink-500/20 flex items-center justify-center">
                <div className="w-6 h-6 bg-pink-400 rounded-full" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-bold text-pink-400">
                {data.chatParticipationScore}
              </span>
              <div className="ml-auto">
                <div className="w-32 h-2 bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-pink-400 to-pink-600 rounded-full"
                    style={{
                      width: `${Math.min(
                        data.chatParticipationScore * 10,
                        100
                      )}%`,
                    }}
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1">engagement level</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* PR Count */}
        <Card className="bg-gradient-to-br from-[#0d0f1a] to-[#14172a] border border-indigo-500/20 rounded-2xl shadow-xl hover:shadow-indigo-500/10 transition-all duration-300">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-gray-300 text-lg">Total PRs</CardTitle>
              <div className="w-10 h-10 rounded-lg bg-indigo-500/20 flex items-center justify-center">
                <div className="w-6 h-6 bg-indigo-400 rounded-full" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-bold text-indigo-400">
                {data.prCount}
              </span>
              <div className="ml-auto">
                <div className="w-32 h-2 bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-400 to-indigo-600 rounded-full"
                    style={{ width: `${Math.min(data.prCount * 10, 100)}%` }}
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1">pull requests</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* MAIN CHARTS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* GitHub Activity */}
        {/* (unchanged code below) */}
        {/* ------------------------------------------------------ */}
        <Card className="bg-gradient-to-br from-[#0d0f1a] to-[#14172a] border border-[#1d2033] rounded-2xl shadow-lg">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-gray-200 text-xl">
                GitHub Activity
              </CardTitle>
              <div className="flex gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-400"></div>
                  <span className="text-sm text-gray-400">Commits</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-purple-400"></div>
                  <span className="text-sm text-gray-400">PRs</span>
                </div>
              </div>
            </div>
            <p className="text-gray-400 text-sm mt-1">
              Weekly contribution trends
            </p>
          </CardHeader>
          <CardContent className="pt-2">
            {githubData.length === 0 ? (
              <div className="h-72 flex flex-col items-center justify-center border border-dashed border-gray-700 rounded-xl">
                <div className="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center mb-4">
                  <div className="w-8 h-8 bg-gray-700 rounded-full" />
                </div>
                <p className="text-gray-500">No GitHub activity available</p>
                <p className="text-gray-600 text-sm">
                  Start contributing to see data
                </p>
              </div>
            ) : (
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={githubData}
                    margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
                  >
                    <CartesianGrid
                      stroke="#1e263a"
                      strokeDasharray="3 3"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="weekStart"
                      stroke="#6b7280"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      stroke="#6b7280"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#0d0f1a",
                        border: "1px solid #1d2033",
                        borderRadius: "8px",
                        color: "white",
                      }}
                      labelStyle={{ color: "#9ca3af" }}
                    />
                    <Line
                      type="monotone"
                      dataKey="commitCount"
                      stroke="#60a5fa"
                      strokeWidth={3}
                      dot={{ fill: "#60a5fa", strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, fill: "#3b82f6" }}
                    />
                    <Line
                      type="monotone"
                      dataKey="prCount"
                      stroke="#a78bfa"
                      strokeWidth={3}
                      dot={{ fill: "#a78bfa", strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, fill: "#8b5cf6" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Peer Benchmark */}
        {/* (unchanged code continues) */}
        <Card className="bg-gradient-to-br from-[#0d0f1a] to-[#14172a] border border-[#1d2033] rounded-2xl shadow-lg">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-gray-200 text-xl">
                Peer Benchmark
              </CardTitle>
              <div className="px-3 py-1 bg-gradient-to-r from-blue-500/10 to-green-500/10 rounded-lg border border-blue-500/20">
                <span className="text-sm text-gray-300">
                  {data.peerBenchmark.userRate > data.peerBenchmark.teamRate
                    ? "Above Average"
                    : "Below Average"}
                </span>
              </div>
            </div>
            <p className="text-gray-400 text-sm mt-1">
              Your performance vs team average
            </p>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={[data.peerBenchmark]}
                  margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                >
                  <CartesianGrid
                    stroke="#1e263a"
                    strokeDasharray="3 3"
                    horizontal={true}
                    vertical={false}
                  />
                  <XAxis tick={false} axisLine={false} />
                  <YAxis
                    stroke="#6b7280"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0d0f1a",
                      border: "1px solid #1d2033",
                      borderRadius: "8px",
                      color: "white",
                    }}
                  />
                  <Legend wrapperStyle={{ paddingTop: "10px" }} />
                  <Bar
                    dataKey="userRate"
                    name="You"
                    fill="url(#userGradient)"
                    radius={[8, 8, 0, 0]}
                    maxBarSize={60}
                  />
                  <Bar
                    dataKey="teamRate"
                    name="Team Avg"
                    fill="url(#teamGradient)"
                    radius={[8, 8, 0, 0]}
                    maxBarSize={60}
                  />
                  <defs>
                    <linearGradient
                      id="userGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="0%" stopColor="#60a5fa" />
                      <stop offset="100%" stopColor="#1d4ed8" />
                    </linearGradient>
                    <linearGradient
                      id="teamGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="0%" stopColor="#4ade80" />
                      <stop offset="100%" stopColor="#16a34a" />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-4">
              <div className="p-4 bg-gradient-to-r from-blue-500/10 to-transparent rounded-xl border border-blue-500/20">
                <p className="text-sm text-gray-400">Your Score</p>
                <p className="text-2xl font-bold text-blue-400 mt-1">
                  {data.peerBenchmark.userRate}
                </p>
              </div>
              <div className="p-4 bg-gradient-to-r from-green-500/10 to-transparent rounded-xl border border-green-500/20">
                <p className="text-sm text-gray-400">Team Average</p>
                <p className="text-2xl font-bold text-green-400 mt-1">
                  {data.peerBenchmark.teamRate}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* FOOTER NOTES */}
      <div className="pt-4">
        <div className="flex items-center justify-center gap-6 text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-400"></div>
            <span>Real-time data</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-purple-400"></div>
            <span>Updated weekly</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-400"></div>
            <span>Compared with team</span>
          </div>
        </div>
      </div>
    </div>
  );
}
