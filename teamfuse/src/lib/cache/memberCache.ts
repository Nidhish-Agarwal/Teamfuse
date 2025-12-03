import { redis } from "@/lib/redis/connection";
import { projectMembersKey } from "./keys";
import { TTL } from "./policy";
import { ProjectMemberWithUser } from "../interfaces/projectMemberWithUser";

export async function getMembersFromCache(id: string) {
  const data = await redis.get(projectMembersKey(id));
  return data ? JSON.parse(data) : null;
}

export async function setMembersInCache(
  id: string,
  project: ProjectMemberWithUser[]
) {
  await redis.set(
    projectMembersKey(id),
    JSON.stringify(project),
    "EX",
    TTL.FIVE_MIN
  );
}

export async function invalidateMemberCache(id: string) {
  await redis.del(projectMembersKey(id));
}
