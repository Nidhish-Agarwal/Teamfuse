// use Prisma client types (stable, standard)
import type {
  ProjectStatus,
  ProjectRole,
  MemberStatus,
  GitHubActivity,
  Insight,
} from "@prisma/client";
import type { ProjectTask } from "../types/projectTask";

export interface ProjectDashboard {
  id: string;
  name: string;
  status: ProjectStatus;
  description: string | null;
  githubRepo: string | null;
  githubRepoId: number | null;
  githubWebhookSecret: string | null;
  createdById: string;
  createdAt: Date;
  lastActive: Date | null;

  members: {
    role: ProjectRole;
    status: MemberStatus;
    id: string;
    user: {
      id: string;
      name: string | null;
      email: string | null;
      avatarUrl: string | null;
    };
  }[];

  tasks: ProjectTask[];

  chatMessages: {
    id: string;
    projectId: string;
    senderId: string;
    recipientId: string | null;
    message: string;
    type: string;
    aiLabel: string | null;
    createdAt: Date;

    sender: {
      id: string;
      name: string | null;
      avatarUrl: string | null;
    } | null;
  }[];

  githubData: GitHubActivity[]; // uses Prisma model type
  insights: Insight[]; // uses Prisma model type
}
