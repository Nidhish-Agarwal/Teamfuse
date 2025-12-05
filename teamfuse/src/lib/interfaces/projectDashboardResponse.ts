import { Insight } from "@prisma/client";
import { ProjectDashboard } from "./projectDashboard";

export interface ProjectDashboardResponse {
  project: ProjectDashboard;

  taskSummary: {
    total: number;
    todo: number;
    inProgress: number;
    completed: number;
  };

  githubSummary: {
    commitCount: number;
    prCount: number;
    linesAdded: number;
    linesDeleted: number;
  };

  latestInsight: Insight | null;
}
