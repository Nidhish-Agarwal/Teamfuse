/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";

interface PresenceMap {
  [userId: string]: "ONLINE" | "IDLE" | "OFFLINE" | "FOCUSED";
}

export function usePresence(projectId: string, currentUserId: string) {
  const [presence, setPresence] = useState<PresenceMap>({});
  const socketRef = useRef<Socket | null>(null);
  const idleRef = useRef<NodeJS.Timeout | null>(null);

  const currentProjectRef = useRef(projectId);
  const currentUserRef = useRef(currentUserId);

  useEffect(() => {
    currentProjectRef.current = projectId;
    currentUserRef.current = currentUserId;
  }, [projectId, currentUserId]);

  useEffect(() => {
    if (!projectId || !currentUserId) return;

    // Create socket if it doesn't exist
    if (!socketRef.current) {
      socketRef.current = io("/", {
        path: "/api/socket/io",
        transports: ["websocket"],
      });

      const socket = socketRef.current;

      socket.on("connect", () => {
        console.log("Socket connected to project:", projectId);

        socket.emit("join_project", {
          projectId: currentProjectRef.current,
          userId: currentUserRef.current,
        });
      });

      socket.on("disconnect", () => {
        console.log("Socket disconnected");
      });

      socket.on("presence_update", (data: any) => {
        // Handle both userId (database ID) and originalUserId (session ID)
        const userIdToUse = data.userId || data.originalUserId;
        if (userIdToUse) {
          setPresence((prev) => ({
            ...prev,
            [userIdToUse]: data.status,
          }));
        }
      });

      // Idle tracking
      const resetIdle = () => {
        if (idleRef.current) {
          clearTimeout(idleRef.current);
        }

        if (socket.connected) {
          socket.emit("status_update", {
            projectId: currentProjectRef.current,
            userId: currentUserRef.current,
            status: "ONLINE",
          });

          idleRef.current = setTimeout(() => {
            if (socket.connected) {
              socket.emit("status_update", {
                projectId: currentProjectRef.current,
                userId: currentUserRef.current,
                status: "IDLE",
              });
            }
          }, 120000); // 2 minutes
        }
      };

      const events = ["mousemove", "keydown", "click", "scroll", "touchstart"];
      events.forEach((event) => {
        window.addEventListener(event, resetIdle, { passive: true });
      });

      resetIdle();

      return () => {
        events.forEach((event) => {
          window.removeEventListener(event, resetIdle);
        });

        if (idleRef.current) {
          clearTimeout(idleRef.current);
        }
      };
    }
    // Re-join if already connected
    else if (socketRef.current.connected) {
      socketRef.current.emit("join_project", {
        projectId: currentProjectRef.current,
        userId: currentUserRef.current,
      });
    }
  }, [projectId, currentUserId]);

  // Cleanup on app close
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (socketRef.current) {
        socketRef.current.emit("leave_project");
        socketRef.current.disconnect();
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  return presence;
}
