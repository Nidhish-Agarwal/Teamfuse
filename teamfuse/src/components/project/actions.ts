"use server";
import { getMemberDetails } from "@/lib/services/memberServices";

export async function fetchMember(
  projectId: string,
  userId: string | undefined
) {
  if (!userId) return null;
  return await getMemberDetails(projectId, userId);
}
