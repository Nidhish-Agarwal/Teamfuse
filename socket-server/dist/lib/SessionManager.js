"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SessionManager = void 0;
/* eslint-disable @typescript-eslint/no-explicit-any */
const prisma_1 = __importDefault(require("./prisma"));
const idleTimers = new Map();
class SessionManager {
    static async startSession(userId, projectId) {
        const now = new Date();
        const existing = await prisma_1.default.presenceLog.findFirst({
            where: { userId, projectId, isActive: true },
        });
        if (existing) {
            this.startIdleTimer(userId, projectId);
            return existing;
        }
        const session = await prisma_1.default.presenceLog.create({
            data: {
                userId,
                projectId,
                status: "ONLINE",
                sessionStart: now,
                isActive: true,
            },
        });
        this.startIdleTimer(userId, projectId);
        return session;
    }
    static startIdleTimer(userId, projectId) {
        const key = `${userId}-${projectId}`;
        if (idleTimers.has(key))
            clearTimeout(idleTimers.get(key));
        const timer = setTimeout(async () => {
            await this.setStatus(userId, projectId, "IDLE");
            idleTimers.delete(key);
        }, this.IDLE_TIMEOUT);
        idleTimers.set(key, timer);
    }
    static async resetIdle(userId, projectId) {
        const session = await prisma_1.default.presenceLog.findFirst({
            where: { userId, projectId, isActive: true },
        });
        if (session?.status === "IDLE") {
            await prisma_1.default.presenceLog.update({
                where: { id: session.id },
                data: { status: "ONLINE" },
            });
        }
        this.startIdleTimer(userId, projectId);
    }
    static async setStatus(userId, projectId, status) {
        await prisma_1.default.presenceLog.updateMany({
            where: { userId, projectId, isActive: true },
            data: { status },
        });
    }
    static async endSession(userId, projectId) {
        const now = new Date();
        const key = `${userId}-${projectId}`;
        if (idleTimers.has(key)) {
            clearTimeout(idleTimers.get(key));
            idleTimers.delete(key);
        }
        const session = await prisma_1.default.presenceLog.findFirst({
            where: { userId, projectId, isActive: true },
        });
        if (!session)
            return;
        const duration = Math.floor((now.getTime() - session.sessionStart.getTime()) / 60000);
        await prisma_1.default.presenceLog.update({
            where: { id: session.id },
            data: {
                sessionEnd: now,
                duration,
                status: "OFFLINE",
                isActive: false,
            },
        });
    }
    static async getSessionsForTimeCalculation(userId, projectId) {
        return prisma_1.default.presenceLog.findMany({
            where: { userId, projectId },
            orderBy: { sessionStart: "asc" },
        });
    }
}
exports.SessionManager = SessionManager;
SessionManager.IDLE_TIMEOUT = 5 * 60 * 1000;
