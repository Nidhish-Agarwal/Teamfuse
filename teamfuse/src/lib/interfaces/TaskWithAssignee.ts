import type { Task, User } from "@prisma/client";

export interface TaskWithAssignee extends Task {
  assignee: User | null;
}
