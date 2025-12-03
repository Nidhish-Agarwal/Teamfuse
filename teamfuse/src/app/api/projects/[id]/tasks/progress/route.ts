import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { invalidateTaskCache } from "@/lib/cache/taskCache";
import { invalidateProjectCache } from "@/lib/cache/projectCache";

export async function PATCH(
  req: Request,
  context: { params: Promise<Record<string, string>> }
) {
  const { id: projectId } = await context.params;

  const { taskId, progress } = await req.json();

  const task = await prisma.task.update({
    where: { id: taskId },
    data: { progress },
  });

  await invalidateTaskCache(projectId);
  await invalidateProjectCache(projectId);

  return NextResponse.json(task);
}
