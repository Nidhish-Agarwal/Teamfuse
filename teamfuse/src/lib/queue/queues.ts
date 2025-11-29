// lib/github/queue/queues.ts
import { Queue } from "bullmq";
import { redis } from "@/lib/redis/connection";

export interface WebhookJobData {
  deliveryId: string;
  projectId: string;
  event: string;
  payload: unknown;
}

export interface SyncJobData {
  syncId: string;
  projectId: string;
  userId: string;
}

export const githubWebhookQueue = new Queue<WebhookJobData>("github:webhooks", {
  connection: redis,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 1000, // 1s base
    },
    removeOnComplete: 50,
    removeOnFail: 100,
  },
});

export const githubSyncQueue = new Queue<SyncJobData>("github:sync", {
  connection: redis,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 1000, // 1s base
    },
    removeOnComplete: 50,
    removeOnFail: 100,
  },
});
