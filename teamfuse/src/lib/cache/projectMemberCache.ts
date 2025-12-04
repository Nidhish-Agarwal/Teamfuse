import { redis } from "@/lib/redis/connection";
import { projectMemberKey } from "./keys";
import { TTL } from "./policy";
import { ProjectMember } from "@/generated/prisma";

export async function getProjectMemberFromCache(
  projectId: string,
  userId: string
) {
  const data = await redis.get(projectMemberKey(projectId, userId));
  return data ? JSON.parse(data) : null;
}

export async function setProjectMemberInCache(
  projectId: string,
  userId: string,
  member: ProjectMember
) {
  await redis.set(
    projectMemberKey(projectId, userId),
    JSON.stringify(member),
    "EX",
    TTL.FIVE_MIN
  );
}

export async function invalidateProjectMemberCache(
  projectId: string,
  userId: string
) {
  await redis.del(projectMemberKey(projectId, userId));
}
