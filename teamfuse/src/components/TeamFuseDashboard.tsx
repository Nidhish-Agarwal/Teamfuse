"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Fuse from "fuse.js";

import { Search, Filter } from "lucide-react";
import ProjectCard from "@/components/cards/ProjectCard";
import DashboardNavBar from "@/components/navigation/DashboardNavBar";
import DashboardStats from "@/components/DashboardStats";
import RecentAcitivityCard from "@/components/cards/RecentAcitivityCard";
import RecentActivityType from "@/lib/interfaces/RecentActivityType";
import ProjectCardType from "@/lib/interfaces/ProjectCardType";
import PendingInviteCard from "./cards/PendingInviteCard";
import CreateProjectDialog from "./project/CreatProjectDialog";

const recentActivity: RecentActivityType[] = [
  {
    id: 1,
    user: "Arjun",
    action: "pushed 3 commits to TeamFuse",
    time: "2h ago",
  },
  {
    id: 2,
    user: "Varsha",
    action: 'completed the task: "UI for task manager"',
    time: "4h ago",
  },
  {
    id: 3,
    user: "Ravi",
    action: 'commented: "We need to divide responsibilities"',
    time: "5h ago",
  },
  {
    id: 4,
    user: "Priya",
    action: "created a new pull request in AI Chat App",
    time: "6h ago",
  },
  {
    id: 5,
    user: "You",
    action: "merged PR #42 in E-commerce Platform",
    time: "8h ago",
  },
];

export default function TeamFuseDashboard({
  projects,
  pendingProjects,
}: {
  projects: ProjectCardType[];
  pendingProjects: ProjectCardType[];
}) {
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [acceptedProjects, setAcceptedProjects] =
    useState<ProjectCardType[]>(projects);
  const [invites, setInvites] = useState<ProjectCardType[]>(pendingProjects);

  // -----------------------------
  // Fuzzy Search Instance (Fuse)
  // -----------------------------
  const fuse = useMemo(() => {
    return new Fuse(acceptedProjects, {
      keys: [
        { name: "name", weight: 0.5 },
        { name: "description", weight: 0.2 },
        { name: "githubRepo", weight: 0.15 },
        { name: "createdBy.name", weight: 0.1 },
        { name: "createdBy.email", weight: 0.05 },
      ],
      threshold: 0.35,
      ignoreLocation: true,
      includeScore: true,
      shouldSort: true,
    });
  }, [acceptedProjects]);
  // -----------------------------
  // Final Filtered Projects
  // -----------------------------
  const filteredProjects = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    // 1) Search (Fuse) — if there is a query
    let searchResults: ProjectCardType[] = acceptedProjects;

    if (q) {
      searchResults = fuse.search(q).map((r) => r.item);
    }

    // 2) Status filter (all / ACTIVE / COMPLETED / ARCHIVED)
    return searchResults.filter((project) => {
      const matchesFilter =
        filterStatus === "all" || project.status === filterStatus;

      return matchesFilter;
    });
  }, [acceptedProjects, searchQuery, filterStatus, fuse]);

  return (
    <div className="min-h-screen relative bg-linear-to-b from-[#0f111a] via-[#141620] to-[#1a1c25] text-white overflow-hidden">
      {/* Background glowing blobs */}
      <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-purple-600/20 blur-[120px] rounded-full"></div>
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-indigo-600/20 blur-[100px] rounded-full"></div>

      {/* Navigation */}
      <DashboardNavBar />

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-80 bg-white/5 backdrop-blur-xl border-r border-white/10 p-6 min-h-[calc(100vh-73px)]">
          <div className="space-y-6">
            {/* Quick Stats */}
            <DashboardStats projects={acceptedProjects} />

            {/* Recent Activity */}
            <div>
              <h2 className="text-lg font-semibold text-indigo-300 mb-3">
                Recent Activity
              </h2>
              <div className="space-y-3">
                {recentActivity.slice(0, 5).map((activity) => (
                  <RecentAcitivityCard key={activity.id} activity={activity} />
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* MAIN CONTENT */}
        <main className="flex-1 p-10">
          <div className="max-w-7xl mx-auto space-y-10">
            {/* Header */}
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-4xl font-extrabold bg-linear-to-r from-indigo-400 via-purple-300 to-pink-300 bg-clip-text text-transparent">
                  My Projects
                </h1>
                <p className="text-gray-400 mt-1">
                  Manage and track all your team projects
                </p>
              </div>

              {/* New Project Button */}
              <CreateProjectDialog setAcceptedProjects={setAcceptedProjects} />
            </div>

            {/* Search & Filters */}

            <div className="flex items-center gap-4 flex-wrap">
              {/* Search Bar */}
              <div className="relative flex-1 min-w-[280px] max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40 pointer-events-none" />
                <Input
                  placeholder="Search projects..."
                  className="
            pl-10 
            bg-white/5 
            border border-white/10 
            text-white 
            placeholder:text-white/40
            focus:border-indigo-400/50
            focus:bg-white/10
            transition-all
            h-11
            rounded-xl
          "
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Filters */}
              <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-2 rounded-xl backdrop-blur-md">
                <div className="flex items-center gap-1.5 pr-2 border-r border-white/10">
                  <Filter className="h-4 w-4 text-indigo-300" />
                  <span className="text-xs text-white/60 font-medium">
                    Filter:
                  </span>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  className={
                    filterStatus === "all"
                      ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700 shadow-md shadow-indigo-500/20"
                      : "text-white/60 hover:text-white hover:bg-white/5"
                  }
                  onClick={() => setFilterStatus("all")}
                >
                  All
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  className={
                    filterStatus === "ACTIVE"
                      ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700 shadow-md shadow-indigo-500/20"
                      : "text-white/60 hover:text-white hover:bg-white/5"
                  }
                  onClick={() => setFilterStatus("ACTIVE")}
                >
                  Active
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  className={
                    filterStatus === "COMPLETED"
                      ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700 shadow-md shadow-indigo-500/20"
                      : "text-white/60 hover:text-white hover:bg-white/5"
                  }
                  onClick={() => setFilterStatus("COMPLETED")}
                >
                  Completed
                </Button>
              </div>
            </div>

            {/* Projects Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredProjects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>

            {acceptedProjects.length === 0 && invites.length > 0 && (
              <div className="my-10 p-6 bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl">
                <p className="text-gray-300 text-center">
                  You don’t have any active projects yet—accept an invitation to
                  get started!
                </p>
              </div>
            )}

            {acceptedProjects.length === 0 && invites.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 opacity-90">
                <svg
                  className="w-40 h-40 mb-6 text-indigo-400/40"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 7.5l9-4.5 9 4.5M3 7.5v9l9 4.5m-9-13.5l9 4.5m0 9l9-4.5v-9m-9 13.5v-9m9-4.5l-9 4.5"
                  />
                </svg>

                <h3 className="text-xl font-semibold text-gray-200 mb-2">
                  No Projects Found
                </h3>

                <p className="text-gray-400 text-sm mb-6 max-w-sm text-center">
                  It seems like you haven&apos;t created a project yet. Get
                  started by creating your first project!
                </p>
              </div>
            )}

            {/* If no results */}
            {filteredProjects.length === 0 && (
              <div className="text-center py-20">
                <p className="text-gray-400 text-lg">
                  No projects found matching your criteria.
                </p>
              </div>
            )}

            {/* Pending Invitations */}
            {invites && invites.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-indigo-300 mb-4">
                  Pending Invitations
                </h2>

                <p className="text-gray-400 text-sm mb-6">
                  These are the projects you’ve been invited to join.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {invites.map((project) => (
                    <PendingInviteCard
                      key={project.id}
                      project={project}
                      setInvites={setInvites}
                      setAcceptedProjects={setAcceptedProjects}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
