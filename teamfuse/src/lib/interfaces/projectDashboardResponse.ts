import { Insight } from "@/generated/prisma";
// import { ProjectDashboard } from "./projectDashboard";
export interface ProjectDashboardResponse {
  project: {
    id: string;
    name: string;
    description: string | null;
    githubRepo: string;
    createdById: string;
    updatedAt: Date | string;
  };

  members: {
    memberId: string;
    userId: string;
    name: string;
    email: string;
    avatarUrl: string | null;
    role: string;
    status: string;
  }[];

  stats: {
    tasks: {
      total: number;
      todo: number;
      inProgress: number;
      completed: number;
    };
    github: {
      commitCount: number;
      prCount: number;
      linesAdded: number;
      linesDeleted: number;
    };
    messages: number;
  };

  latestInsight: Insight | null;
}
