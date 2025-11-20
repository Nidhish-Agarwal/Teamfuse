"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Search, Filter } from "lucide-react";
import ProjectCard from "@/components/cards/ProjectCard";
import ProjectCardType from "@/lib/interfaces/ProjectCardType";
import DashboardNavBar from "@/components/navigation/DashboardNavBar";
import DashboardStats from "@/components/DashboardStats";
import RecentAcitivityCard from "@/components/cards/RecentAcitivityCard";
import RecentActivityType from "@/lib/interfaces/RecentActivityType";

// Mock Data
const mockProjects: ProjectCardType[] = [
  {
    id: 1,
    name: "TeamFuse",
    role: "Leader",
    lastActive: "4h ago",
    tasksCompleted: 60,
    commits: 32,
    lastMessage: "2h ago",
    status: "active",
  },
  {
    id: 2,
    name: "AI Chat App",
    role: "Member",
    lastActive: "1d ago",
    tasksCompleted: 85,
    commits: 18,
    lastMessage: "5h ago",
    status: "active",
  },
  {
    id: 3,
    name: "E-commerce Platform",
    role: "Leader",
    lastActive: "3h ago",
    tasksCompleted: 45,
    commits: 24,
    lastMessage: "1h ago",
    status: "active",
  },
  {
    id: 4,
    name: "Mobile App Redesign",
    role: "Member",
    lastActive: "2d ago",
    tasksCompleted: 90,
    commits: 12,
    lastMessage: "1d ago",
    status: "completed",
  },
  {
    id: 5,
    name: "Analytics Dashboard",
    role: "Leader",
    lastActive: "6h ago",
    tasksCompleted: 35,
    commits: 28,
    lastMessage: "3h ago",
    status: "active",
  },
];

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

export default function TeamFuseDashboard() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredProjects = mockProjects.filter((project) => {
    const matchesSearch = project.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesFilter =
      filterStatus === "all" || project.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen relative bg-gradient-to-b from-[#0f111a] via-[#141620] to-[#1a1c25] text-white overflow-hidden">
      
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
            <DashboardStats mockProjects={mockProjects} />

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
                <h1 className="text-4xl font-extrabold bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-300 bg-clip-text text-transparent">
                  My Projects
                </h1>
                <p className="text-gray-400 mt-1">
                  Manage and track all your team projects
                </p>
              </div>

              {/* New Project Button */}
              <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 shadow-lg shadow-indigo-500/30">
                    <Plus className="h-4 w-4 mr-2" />
                    New Project
                  </Button>
                </DialogTrigger>

                {/* Modal */}
                <DialogContent className="sm:max-w-[500px] bg-[#10121c] text-white border border-white/10 backdrop-blur-xl">
                  <DialogHeader>
                    <DialogTitle className="text-xl font-bold text-indigo-300">
                      Create New Project
                    </DialogTitle>
                    <DialogDescription className="text-gray-400">
                      Set up a new project and invite your team members
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-4 py-4">
                    <div>
                      <Label htmlFor="name">Project Name</Label>
                      <Input id="name" className="bg-white/5 border-white/10 text-white" />
                    </div>

                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea id="description" className="bg-white/5 border-white/10 text-white" />
                    </div>

                    <div>
                      <Label htmlFor="repo">GitHub Repository URL</Label>
                      <Input id="repo" className="bg-white/5 border-white/10 text-white" />
                    </div>

                    <div>
                      <Label htmlFor="members">Invite Team Members</Label>
                      <Input id="members" className="bg-white/5 border-white/10 text-white" />
                    </div>
                  </div>

                  {/* Modal Footer */}
                  <div className="flex justify-end gap-3">
                    <Button variant="outline" className="border-white/20 text-white" onClick={() => setIsCreateModalOpen(false)}>
                      Cancel
                    </Button>
                    <Button className="bg-gradient-to-r from-indigo-500 to-purple-600">
                      Create Project
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {/* Search & Filters */}
            <div className="flex items-center gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search projects..."
                  className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-gray-400"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Filters */}
              <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-xl backdrop-blur-md">
                <Filter className="h-4 w-4 text-indigo-300" />

                <Button
                  variant={filterStatus === "all" ? "default" : "outline"}
                  size="sm"
                  className={filterStatus === "all" ? "bg-indigo-500 text-white" : "border-white/10 text-gray-300"}
                  onClick={() => setFilterStatus("all")}
                >
                  All
                </Button>

                <Button
                  variant={filterStatus === "active" ? "default" : "outline"}
                  size="sm"
                  className={filterStatus === "active" ? "bg-indigo-500 text-white" : "border-white/10 text-gray-300"}
                  onClick={() => setFilterStatus("active")}
                >
                  Active
                </Button>

                <Button
                  variant={filterStatus === "completed" ? "default" : "outline"}
                  size="sm"
                  className={filterStatus === "completed" ? "bg-indigo-500 text-white" : "border-white/10 text-gray-300"}
                  onClick={() => setFilterStatus("completed")}
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

            {/* If no results */}
            {filteredProjects.length === 0 && (
              <div className="text-center py-20">
                <p className="text-gray-400 text-lg">
                  No projects found matching your criteria.
                </p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
