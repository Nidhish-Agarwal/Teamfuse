"use client";

import { useParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import dynamic from "next/dynamic";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

// Dynamically import Recharts to avoid HMR issues
const RechartsComponent = dynamic(() => import("./RechartsWrapper"), {
  ssr: false,
  loading: () => (
    <div className="h-72 flex items-center justify-center text-gray-500">
      Loading charts...
    </div>
  ),
});

// Loader for the main page
export default function TeamPerformancePage() {
  return (
    <Suspense
      fallback={
        <div className="p-12 flex justify-center items-center h-[80vh] text-gray-400">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-400">
              Loading team performance dashboard...
            </p>
          </div>
        </div>
      }
    >
      <TeamPerformanceContent />
    </Suspense>
  );
}

// Main content component
function TeamPerformanceContent() {
  const params = useParams();
  const projectId = params.id as string;

  const [perf, setPerf] = useState<TeamPerformanceResponse | null>(null);
  const [presence, setPresence] = useState<PresenceMember[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // FETCH BOTH APIs
  useEffect(() => {
    if (!projectId) return;

    const fetchData = async () => {
      try {
        const [perfRes, presRes] = await Promise.all([
          fetch(`/api/projects/${projectId}/team-performance`).then((r) =>
            r.json()
          ),
          fetch(`/api/projects/${projectId}/presence`).then((r) => r.json()),
        ]);

        if (perfRes.error || presRes.error) {
          throw new Error(
            perfRes.error || presRes.error || "Failed to fetch data"
          );
        }

        setPerf(perfRes.data);
        setPresence(presRes.data);
      } catch (err) {
        console.error("Fetch error:", err);
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load team performance data"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [projectId]);

  if (error) {
    return (
      <div className="p-12 flex flex-col items-center justify-center h-[80vh] text-gray-400">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
            <div className="w-8 h-8 bg-red-500 rounded-full" />
          </div>
          <h3 className="text-xl font-semibold text-red-400 mb-2">
            Error Loading Data
          </h3>
          <p className="text-gray-400 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (loading || !perf || !presence) {
    return (
      <div className="p-12 flex justify-center items-center h-[80vh] text-gray-400">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading team performance data...</p>
        </div>
      </div>
    );
  }

  const memberRows = perf.members.map((m) => {
    const pres = presence.find((p) => p.userId === m.user.id);
    const commits = perf.commits.find((c) => c.userId === m.user.id);
    const chats = perf.chatCounts.find((c) => c.senderId === m.user.id);
    const task = perf.userCompletion.find((t) => t.userId === m.user.id);
    const taskWeight = perf.taskWeights.find((t) => t.assigneeId === m.user.id);

    // PR lookup
    const prCount =
      perf.prCounts.find((p) => p.authorLogin === m.user.email.split("@")[0])
        ?._count ?? 0;

    const totalMinutes = pres?.totalActiveMinutes ?? 0;
    const hoursRounded = Math.round((totalMinutes / 60) * 10) / 10;

    return {
      id: m.user.id,
      name: m.user.name,
      email: m.user.email,
      role: m.role,
      hours: hoursRounded,
      commits: commits?._sum.commitCount ?? 0,
      prs: prCount,
      chats: chats?._count ?? 0,
      completionRate: task?.rate ?? 0,
      taskWeight: taskWeight?._sum.weight ?? 0,
    };
  });

  const sortedByCompletion = [...memberRows].sort(
    (a, b) => a.completionRate - b.completionRate
  );
  const hasBottlenecks = sortedByCompletion[0]?.completionRate < 50;

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto text-gray-100">
      {/* HEADER */}
      <div className="space-y-3 mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 text-transparent bg-clip-text">
              Team Performance Dashboard
            </h1>
            <p className="text-gray-300 mt-2">
              Comprehensive analytics and insights for the entire team
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="px-4 py-2 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl border border-blue-500/30">
              <p className="text-sm text-gray-300">
                {perf.members.length} Members
              </p>
            </div>
            <div
              className={`px-4 py-2 rounded-xl border ${hasBottlenecks ? "bg-red-500/10 border-red-500/30" : "bg-green-500/10 border-green-500/30"}`}
            >
              <p
                className={`text-sm ${hasBottlenecks ? "text-red-300" : "text-green-300"}`}
              >
                {hasBottlenecks ? "Bottlenecks Detected" : "Healthy Team"}
              </p>
            </div>
          </div>
        </div>
        <div className="h-px bg-gradient-to-r from-transparent via-blue-500/30 to-transparent" />
      </div>

      {/* TOP METRIC CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-[#0d0f1a] to-[#14172a] border border-blue-500/20 rounded-2xl shadow-xl hover:shadow-blue-500/10 transition-all duration-300">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-gray-200 text-lg">
                Project Completion
              </CardTitle>
              <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <div className="w-6 h-6 bg-blue-400 rounded-full" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-bold text-blue-400">
                {perf.projectCompletionRate}%
              </span>
              <div className="ml-auto">
                <div className="w-32 h-2 bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full"
                    style={{ width: `${perf.projectCompletionRate}%` }}
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1">overall progress</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-[#0d0f1a] to-[#14172a] border border-purple-500/20 rounded-2xl shadow-xl hover:shadow-purple-500/10 transition-all duration-300">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-gray-200 text-lg">
                Bottlenecks
              </CardTitle>
              <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                <div className="w-6 h-6 bg-purple-400 rounded-full" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {perf.bottlenecks.length === 0 ? (
              <div className="flex items-center gap-2 text-green-400">
                <div className="w-2 h-2 rounded-full bg-green-400"></div>
                <p className="text-sm">No bottlenecks detected</p>
              </div>
            ) : (
              <div className="space-y-2">
                {perf.bottlenecks.map((b) => {
                  const member = memberRows.find((m) => m.id === b.userId);
                  return (
                    <div
                      key={b.userId}
                      className="flex items-center justify-between p-2 bg-red-500/10 rounded-lg"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-red-400"></div>
                        <span className="text-sm text-gray-300">
                          {member?.name ?? b.userId}
                        </span>
                      </div>
                      <span className="text-sm text-red-400">{b.rate}%</span>
                    </div>
                  );
                })}
              </div>
            )}
            <p className="text-xs text-gray-500">
              Members with completion &lt; 50%
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-[#0d0f1a] to-[#14172a] border border-pink-500/20 rounded-2xl shadow-xl hover:shadow-pink-500/10 transition-all duration-300">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-gray-200 text-lg">
                AI Summary
              </CardTitle>
              <div className="w-10 h-10 rounded-lg bg-pink-500/20 flex items-center justify-center">
                <div className="w-6 h-6 bg-pink-400 rounded-full" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-gray-300 text-sm leading-relaxed bg-gray-900/30 p-3 rounded-lg border border-gray-800">
              {perf.aiSummary}
            </div>
            <div className="flex items-center gap-2 mt-3">
              <div className="w-2 h-2 rounded-full bg-pink-400"></div>
              <p className="text-xs text-gray-500">
                AI-generated team analysis
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* CHARTS SECTION - Using dynamic import */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-gradient-to-br from-[#0d0f1a] to-[#14172a] border border-[#1d2033] rounded-2xl shadow-lg">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-gray-200 text-xl">
                Activity per Member
              </CardTitle>
              <div className="flex gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-400"></div>
                  <span className="text-sm text-gray-400">Commits</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-400"></div>
                  <span className="text-sm text-gray-400">PRs</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-pink-400"></div>
                  <span className="text-sm text-gray-400">Chats</span>
                </div>
              </div>
            </div>
            <p className="text-gray-400 text-sm mt-1">
              Contribution distribution across team members
            </p>
          </CardHeader>
          <CardContent>
            <RechartsComponent type="bar" data={memberRows} height={280} />
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-[#0d0f1a] to-[#14172a] border border-[#1d2033] rounded-2xl shadow-lg">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-gray-200 text-xl">
                Workload Distribution
              </CardTitle>
              <div className="px-3 py-1 bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-lg border border-purple-500/20">
                <span className="text-sm text-gray-300">
                  {perf.taskWeights.length} Members
                </span>
              </div>
            </div>
            <p className="text-gray-400 text-sm mt-1">
              Task weight distribution across team
            </p>
          </CardHeader>
          <CardContent>
            <RechartsComponent
              type="pie"
              data={perf.taskWeights.map((tw) => ({
                name:
                  memberRows.find((m) => m.id === tw.assigneeId)?.name ??
                  "Unknown",
                value: tw._sum.weight,
              }))}
              height={280}
            />
          </CardContent>
        </Card>
      </div>

      {/* TEAM MEMBER TABLE */}
      <Card className="bg-gradient-to-br from-[#0d0f1a] to-[#14172a] border border-[#1d2033] rounded-2xl shadow-lg">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-gray-200 text-xl">
              Team Member Breakdown
            </CardTitle>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
              <span className="text-sm text-gray-400">Real-time data</span>
            </div>
          </div>
          <p className="text-gray-400 text-sm mt-1">
            Detailed performance metrics for each team member
          </p>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-xl border border-gray-800">
            <table className="w-full text-left">
              <thead className="bg-gray-900/50">
                <tr>
                  <th className="p-4 border-b border-gray-800 text-gray-300 font-medium">
                    Member
                  </th>
                  <th className="p-4 border-b border-gray-800 text-gray-300 font-medium">
                    Role
                  </th>
                  <th className="p-4 border-b border-gray-800 text-gray-300 font-medium">
                    Hours
                  </th>
                  <th className="p-4 border-b border-gray-800 text-gray-300 font-medium">
                    Commits
                  </th>
                  <th className="p-4 border-b border-gray-800 text-gray-300 font-medium">
                    PRs
                  </th>
                  <th className="p-4 border-b border-gray-800 text-gray-300 font-medium">
                    Chats
                  </th>
                  <th className="p-4 border-b border-gray-800 text-gray-300 font-medium">
                    Task Weight
                  </th>
                  <th className="p-4 border-b border-gray-800 text-gray-300 font-medium">
                    Completion
                  </th>
                </tr>
              </thead>
              <tbody>
                {memberRows.map((row) => (
                  <tr
                    key={row.id}
                    className="border-b border-gray-800 hover:bg-gray-800/30 transition-colors"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 flex items-center justify-center">
                          <span className="text-sm font-medium text-gray-300">
                            {row.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="text-gray-200 font-medium">
                            {row.name}
                          </p>
                          <p className="text-xs text-gray-500 truncate max-w-[150px]">
                            {row.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="px-3 py-1 text-xs bg-gray-800/50 text-gray-300 rounded-full">
                        {row.role}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-200">{row.hours}h</span>
                        <div className="w-16 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-blue-400 to-purple-400 rounded-full"
                            style={{
                              width: `${Math.min(row.hours * 10, 100)}%`,
                            }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="text-gray-200">{row.commits}</span>
                    </td>
                    <td className="p-4">
                      <span className="text-gray-200">{row.prs}</span>
                    </td>
                    <td className="p-4">
                      <span className="text-gray-200">{row.chats}</span>
                    </td>
                    <td className="p-4">
                      <span className="text-gray-200">
                        {row.taskWeight} pts
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <span
                          className={`text-lg font-semibold ${row.completionRate < 50 ? "text-red-400" : "text-green-400"}`}
                        >
                          {row.completionRate}%
                        </span>
                        <div className="w-20 h-2 bg-gray-800 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${row.completionRate < 50 ? "bg-gradient-to-r from-red-400 to-red-600" : "bg-gradient-to-r from-green-400 to-green-600"}`}
                            style={{ width: `${row.completionRate}%` }}
                          />
                        </div>
                      </div>
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

// Types (keep same as before)
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
  prCounts: { authorLogin: string; _count: number }[];
  chatCounts: ChatCount[];
  taskWeights: TaskWeight[];
  sentiment: SentimentItem[];
  projectCompletionRate: number;
  bottlenecks: Bottleneck[];
  userCompletion: UserCompletion[];
  aiSummary: string;
}
