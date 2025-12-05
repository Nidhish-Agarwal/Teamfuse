"use client";

import { useEffect, useState, useRef } from "react";
import { io, Socket } from "socket.io-client";

interface PresenceMap {
  [userId: string]: "ONLINE" | "IDLE" | "OFFLINE" | "FOCUSED";
}

let socket: Socket | null = null;
let activityTimeout: NodeJS.Timeout | null = null;

export function usePresence(projectId: string, currentUserId: string) {
  const [presence, setPresence] = useState<PresenceMap>({});
  const joinedRef = useRef(false);

  useEffect(() => {
    if (!projectId || !currentUserId) return;

    if (!socket) {
      socket = io(process.env.NEXT_PUBLIC_SOCKET_URL!,
        { path: "/api/socket/io" }
      );

      socket.on("presence_update", (data) => {
        setPresence((prev) => ({
          ...prev,
          [data.userId]: data.status,
        }));
      });
    }

    if (!joinedRef.current) {
      socket.emit("join_project", { projectId, userId: currentUserId });
      joinedRef.current = true;
    }

    //Emit activity if any keyboard/mouse/touch happens
    const handleActivity = () => {
      if (activityTimeout) return;
      activityTimeout = setTimeout(() => {
        socket?.emit("activity", { userId: currentUserId, projectId });
        activityTimeout = null;
      }, 600);
    };

    const events = [
      "mousemove",
      "mousedown",
      "keypress",
      "keydown",
      "scroll",
      "wheel",
      "touchstart",
    ];

    events.forEach((ev) => document.addEventListener(ev, handleActivity));

    return () => {
      events.forEach((ev) => document.removeEventListener(ev, handleActivity));
      if (activityTimeout) clearTimeout(activityTimeout);
    };
  }, [projectId, currentUserId]);

  return presence;
}
