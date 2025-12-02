"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

// TYPES ........................................

interface PresenceMember {
  userId: string;
  name: string;
  avatarUrl: string | null;
  status: string;
  lastActive: string;
  totalActiveMinutes: number;
  todayMinutes: number;
}

interface MemberUser {
  id: string;
  name: string;
  email: string;
}

interface Member {
  user: MemberUser;
  role: string;
}

interface CommitStats {
  userId: string;
  _sum: {
    commitCount: number | null;
    prCount: number | null;
  };
}

interface ChatCount {
  senderId: string;
  _count: number;
}

interface TaskWeight {
  assigneeId: string;
  _sum: { weight: number };
}

interface SentimentItem {
  aiLabel: string | null;
  _count: number;
}

interface UserCompletion {
  userId: string;
  rate: number;
}

interface Bottleneck {
  userId: string;
  rate: number;
}

interface TeamPerformanceResponse {
  members: Member[];
  commits: CommitStats[];
  chatCounts: ChatCount[];
  taskWeights: TaskWeight[];
  sentiment: SentimentItem[];
  projectCompletionRate: number;
  bottlenecks: Bottleneck[];
  userCompletion: UserCompletion[];
  aiSummary: string;
}

interface MemberRow {
  id: string;
  name: string;
  email: string;
  role: string;
  hours: number;
  commits: number;
  prs: number;
  chats: number;
  completionRate: number;
}

interface PieItem {
  name: string;
  value: number;
  [key: string]: string | number;
}

// ----------------------------------------

export default function TeamPerformancePage() {
  const params = useParams();
  const projectId = params.id as string;

  const [perf, setPerf] = useState<TeamPerformanceResponse | null>(null);
  const [presence, setPresence] = useState<PresenceMember[] | null>(null);
  const [loading, setLoading] = useState(true);

  // FETCH BOTH APIs
  useEffect(() => {
    if (!projectId) return;

    Promise.all([
      fetch(`/api/projects/${projectId}/team-performance`).then((r) =>
        r.json()
      ),
      fetch(`/api/projects/${projectId}/presence`).then((r) => r.json()),
    ]).then(([perfRes, presRes]) => {
      setPerf(perfRes.data);
      setPresence(presRes.data);
      setLoading(false);
    });
  }, [projectId]);

  if (loading || !perf || !presence) {
    return (
      <div className="p-12 flex justify-center items-center h-[80vh] text-gray-400">
        Loading team performance…
      </div>
    );
  }

  const COLORS = ["#60a5fa", "#4ade80", "#f472b6", "#fb923c", "#a78bfa"];

  // MEMBER TABLE ROWS (correct hours)
  const memberRows: MemberRow[] = perf.members.map((m) => {
    const pres = presence.find((p) => p.userId === m.user.id);
    const commits = perf.commits.find((c) => c.userId === m.user.id);
    const chats = perf.chatCounts.find((c) => c.senderId === m.user.id);
    const task = perf.userCompletion.find((t) => t.userId === m.user.id);

    const totalMinutes = pres?.totalActiveMinutes ?? 0;
    const hoursRounded = Math.round((totalMinutes / 60) * 10) / 10;

    return {
      id: m.user.id,
      name: m.user.name,
      email: m.user.email,
      role: m.role,
      hours: hoursRounded,
      commits: commits?._sum.commitCount ?? 0,
      prs: commits?._sum.prCount ?? 0,
      chats: chats?._count ?? 0,
      completionRate: task?.rate ?? 0,
    };
  });

  const sentimentData: PieItem[] = perf.sentiment.map((s) => ({
    name: s.aiLabel ?? "Unknown",
    value: s._count,
  }));

  // ---------------- UI -----------------

  return (
    <div className="p-10 space-y-12 max-w-7xl mx-auto text-gray-100">
      {/* TITLE */}
      <div className="space-y-2">
        <h1 className="text-4xl font-bold tracking-tight text-white">
          Team Performance
        </h1>
        <p className="text-gray-400">Insightful analytics for this project.</p>
      </div>

      {/* TOP METRIC CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <Card className="bg-gradient-to-b from-gray-900/80 to-gray-950/90 border border-gray-800 shadow-xl rounded-2xl backdrop-blur-lg">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-300">
              Project Completion
            </CardTitle>
          </CardHeader>
          <CardContent className="text-5xl font-bold text-blue-400">
            {perf.projectCompletionRate}%
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-b from-gray-900/80 to-gray-950/90 border border-gray-800 shadow-xl rounded-2xl backdrop-blur-lg">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-300">
              Bottlenecks
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-gray-300 text-sm">
            {perf.bottlenecks.length === 0 ? (
              <p className="text-gray-400">No bottlenecks detected.</p>
            ) : (
              perf.bottlenecks.map((b) => (
                <p key={b.userId} className="text-red-400 text-sm">
                  • {b.userId} has low completion
                </p>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-b from-gray-900/80 to-gray-950/90 border border-gray-800 shadow-xl rounded-2xl backdrop-blur-lg">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-300">
              AI Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="text-gray-300 text-sm leading-relaxed">
            {perf.aiSummary}
          </CardContent>
        </Card>
      </div>

      {/* MEMBER ACTIVITY CHART */}
      <Card className="bg-gray-900/60 border border-gray-800 rounded-2xl shadow-xl backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-gray-200">Activity per Member</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={memberRows}>
              <XAxis dataKey="name" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip
                contentStyle={{ background: "#111827", borderRadius: 8 }}
              />
              <Legend />
              <Bar dataKey="commits" fill="#60a5fa" />
              <Bar dataKey="prs" fill="#4ade80" />
              <Bar dataKey="chats" fill="#f472b6" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* FAIRNESS PIE */}
      <Card className="bg-gray-900/60 border border-gray-800 rounded-2xl shadow-xl backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-gray-200">Workload Fairness</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <PieChart>
              <Pie
                data={perf.taskWeights.map((tw) => ({
                  name:
                    memberRows.find((m) => m.id === tw.assigneeId)?.name ??
                    "Unknown",
                  value: tw._sum.weight,
                }))}
                innerRadius={60}
                outerRadius={120}
                paddingAngle={4}
                dataKey="value"
              >
                {perf.taskWeights.map((_, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* SENTIMENT PIE */}
      <Card className="bg-gray-900/60 border border-gray-800 rounded-2xl shadow-xl backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-gray-200">Team Sentiment</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={sentimentData}
                innerRadius={40}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
              >
                {sentimentData.map((_, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Legend />
              <Tooltip
                contentStyle={{ background: "#111827", borderRadius: 8 }}
              />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* MEMBER TABLE */}
      <Card className="bg-gray-900/40 border border-gray-800 rounded-2xl shadow-xl backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-gray-200">Team Member Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-900/50 text-gray-300">
                <tr>
                  <th className="p-3 border-b border-gray-800">Name</th>
                  <th className="p-3 border-b border-gray-800">Hours</th>
                  <th className="p-3 border-b border-gray-800">Commits</th>
                  <th className="p-3 border-b border-gray-800">PRs</th>
                  <th className="p-3 border-b border-gray-800">Chats</th>
                  <th className="p-3 border-b border-gray-800">Completion %</th>
                </tr>
              </thead>

              <tbody>
                {memberRows.map((row) => (
                  <tr
                    key={row.id}
                    className="border-b border-gray-800 hover:bg-gray-800/50 transition-colors"
                  >
                    <td className="p-3">{row.name}</td>
                    <td className="p-3">{row.hours}h</td>
                    <td className="p-3">{row.commits}</td>
                    <td className="p-3">{row.prs}</td>
                    <td className="p-3">{row.chats}</td>
                    <td
                      className={`p-3 font-semibold ${
                        row.completionRate < 40
                          ? "text-red-400"
                          : "text-green-400"
                      }`}
                    >
                      {row.completionRate}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
