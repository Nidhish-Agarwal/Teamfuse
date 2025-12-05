import type { $Enums } from "@prisma/client";

export type ProjectTask = {
  id: string;
  title: string;
  status: $Enums.TaskStatus;
  assigneeId: string | null;
  priority: $Enums.TaskPriority;
};
