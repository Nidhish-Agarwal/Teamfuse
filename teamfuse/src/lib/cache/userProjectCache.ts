import { redis } from "@/lib/redis/connection";
import { userProjectsKey } from "./keys";
import { TTL } from "./policy";
import ProjectCardType from "../interfaces/ProjectCardType";

export async function getUserProjectFromCache(id: string) {
  const data = await redis.get(userProjectsKey(id));
  return data ? JSON.parse(data) : null;
}

export async function setUserProjectInCache(
  id: string,
  project: { accepted: ProjectCardType[]; pending: ProjectCardType[] }
) {
  await redis.set(
    userProjectsKey(id),
    JSON.stringify(project),
    "EX",
    TTL.FIVE_MIN
  );
}

export async function invalidateUserProjectCache(id: string) {
  await redis.del(userProjectsKey(id));
}
