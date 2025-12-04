// src/lib/cache/keys.ts

export const userKey = (id: string) => `app:user:${id}`;
export const userProjectsKey = (id: string) => `app:user:${id}:projects`;

export const projectKey = (id: string) => `app:project:${id}`;
export const projectStatsKey = (id: string) => `app:project:${id}:stats`;
export const projectTaskKey = (id: string) => `app:project:${id}:task`;
export const projectMembersKey = (id: string) => `app:project:${id}:members`;
export const projectMemberKey = (projectId: string, userId: string) =>
  `app:project:${projectId}:member:${userId}`;
export const projectFeedbackKey = (id: string) => `app:project:${id}:feedback`;
