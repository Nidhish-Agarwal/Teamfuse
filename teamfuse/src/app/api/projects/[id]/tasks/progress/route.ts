import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { invalidateTaskCache } from "@/lib/cache/taskCache";
import { invalidateProjectCache } from "@/lib/cache/projectCache";

export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;
  const projectId = params.id;
  const { taskId, progress } = await req.json();

  const task = await prisma.task.update({
    where: { id: taskId },
    data: { progress },
  });

  await invalidateTaskCache(projectId);
  await invalidateProjectCache(projectId);

  return NextResponse.json(task);
}
