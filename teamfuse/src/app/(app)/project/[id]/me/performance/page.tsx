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
  peerBenchmark: PeerBenchmark;
}

export default function ProjectPerformancePage() {
  const { id: projectId } = useParams();
  const [data, setData] = useState<PerformanceResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!projectId) return;

    fetch(`/api/projects/${projectId}/performance`)
      .then((res) => res.json())
      .then((res) => {
        setData(res.data as PerformanceResponse);
        setLoading(false);
      });
  }, [projectId]);

  if (loading || !data) {
    return (
      <div className="p-10 flex justify-center items-center h-[80vh] text-gray-400">
        Loading performance…
      </div>
    );
  }

  const githubData = Array.isArray(data.github) ? data.github : [];

  return (
    <div className="p-8 space-y-12 max-w-7xl mx-auto text-white">
      {/* HEADER */}
      <div className="space-y-1">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 text-transparent bg-clip-text">
          My Performance
        </h1>
        <p className="text-gray-400">
          Track your contribution insights for this project.
        </p>
      </div>

      {/* METRICS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-[#0d0f1a] border border-[#1d2033] rounded-2xl shadow-xl">
          <CardHeader>
            <CardTitle className="text-gray-300">
              Task Completion Rate
            </CardTitle>
          </CardHeader>
          <CardContent className="text-5xl font-bold text-blue-400">
            {data.taskCompletionRate}%
          </CardContent>
        </Card>

        <Card className="bg-[#0d0f1a] border border-[#1d2033] rounded-2xl shadow-xl">
          <CardHeader>
            <CardTitle className="text-gray-300">Avg Feedback</CardTitle>
          </CardHeader>
          <CardContent className="text-5xl font-bold text-purple-400">
            {data.avgFeedback?.toFixed(1) ?? "0.0"} / 5
          </CardContent>
        </Card>

        <Card className="bg-[#0d0f1a] border border-[#1d2033] rounded-2xl shadow-xl">
          <CardHeader>
            <CardTitle className="text-gray-300">Chat Participation</CardTitle>
          </CardHeader>
          <CardContent className="text-5xl font-bold text-pink-400">
            {data.chatParticipationScore}
          </CardContent>
        </Card>
      </div>

      {/* GITHUB ACTIVITY */}
      <Card className="bg-[#0d0f1a] border border-[#1d2033] rounded-2xl shadow-lg">
        <CardHeader>
          <CardTitle className="text-gray-300">GitHub Activity</CardTitle>
        </CardHeader>
        <CardContent>
          {githubData.length === 0 ? (
            <p className="text-gray-500">No GitHub activity available.</p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={githubData}>
                <CartesianGrid stroke="#1e263a" strokeDasharray="3 3" />
                <XAxis dataKey="weekStart" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="commitCount"
                  stroke="#60a5fa"
                  strokeWidth={3}
                />
                <Line
                  type="monotone"
                  dataKey="prCount"
                  stroke="#a78bfa"
                  strokeWidth={3}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* PEER BENCHMARK */}
      <Card className="bg-[#0d0f1a] border border-[#1d2033] rounded-2xl shadow-lg">
        <CardHeader>
          <CardTitle className="text-gray-300">Peer Benchmark</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={[data.peerBenchmark]}>
              <XAxis tick={false} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar
                dataKey="userRate"
                name="You"
                fill="#60a5fa"
                radius={[6, 6, 0, 0]}
              />
              <Bar
                dataKey="teamRate"
                name="Team Avg"
                fill="#4ade80"
                radius={[6, 6, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
