"use client";

import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

interface PresenceMap {
  [userId: string]: "ONLINE" | "IDLE" | "OFFLINE" | "FOCUSED";
}

let socket: Socket | null = null;

export function usePresence(projectId: string, currentUserId: string) {
  const [presence, setPresence] = useState<PresenceMap>({});

  useEffect(() => {
    if (!projectId || !currentUserId) return;

    if (!socket) {
      socket = io(
        process.env.NODE_ENV === "production" ? "/" : "http://localhost:3000",
        {
          path: "/api/socket/io",
          transports: ["websocket"],
          reconnection: true,
        }
      );

      socket.on("presence_update", (data) => {
        setPresence((prev) => ({
          ...prev,
          [data.userId]: data.status,
        }));
      });
    }

    socket.emit("join_project", {
      projectId,
      userId: currentUserId,
    });

    return () => {};
  }, [projectId, currentUserId]);

  return presence;
}
