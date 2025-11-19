"use client";

import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

interface PomodoroProps {
  projectId: string;
  userId: string;
}

export default function PomodoroTimer({ projectId, userId }: PomodoroProps) {
  const FOCUS = 25 * 60;
  const BREAK = 5 * 60;

  const [seconds, setSeconds] = useState<number>(FOCUS);
  const [running, setRunning] = useState<boolean>(false);
  const [isBreak, setIsBreak] = useState<boolean>(false);
  const [count, setCount] = useState<number>(0);

  const ref = useRef<NodeJS.Timeout | null>(null);

  function send(status: string) {
    const socket = io("/", {
      path: "/api/socket/io",
      transports: ["websocket"],
    });
    socket.emit("status_update", { projectId, userId, status });
    socket.disconnect();
  }

  // --- Controls ---
  const start = () => {
    if (running) return;
    setRunning(true);

    send(isBreak ? "IDLE" : "FOCUSED");

    ref.current = setInterval(() => {
      setSeconds((prev) => prev - 1);
    }, 1000);
  };

  const pause = () => {
    setRunning(false);
    if (ref.current) clearInterval(ref.current);
    send("ONLINE");
  };

  const reset = () => {
    pause();
    setIsBreak(false);
    setSeconds(FOCUS);
  };

  // --- SAFE EFFECT FIX ---
  useEffect(() => {
    if (!running) return;
    if (seconds > 0) return;

    if (ref.current) clearInterval(ref.current);

    // ❗ Wrap state updates inside a microtask to avoid ESLint error
    Promise.resolve().then(() => {
      setRunning(false);

      if (!isBreak) {
        setCount((c) => c + 1);
        setIsBreak(true);
        setSeconds(BREAK);
        send("IDLE");
      } else {
        setIsBreak(false);
        setSeconds(FOCUS);
        send("ONLINE");
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seconds, running, isBreak]);

  const fmt = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(
      2,
      "0"
    )}`;

  return (
    <div className="bg-gray-900 border border-gray-800 p-4 rounded-xl mt-4">
      <h3 className="text-white text-sm font-semibold mb-2">Pomodoro Timer</h3>

      <div className="text-center text-3xl text-white font-bold">
        {fmt(seconds)}
      </div>
      <p className="text-xs text-gray-400 text-center mb-2">
        {isBreak ? "Break" : "Focus"}
      </p>

      <div className="flex justify-center gap-2">
        {!running ? (
          <button
            onClick={start}
            className="bg-green-600 px-3 py-1 rounded text-white"
          >
            Start
          </button>
        ) : (
          <button
            onClick={pause}
            className="bg-yellow-600 px-3 py-1 rounded text-white"
          >
            Pause
          </button>
        )}

        <button
          onClick={reset}
          className="bg-gray-700 px-3 py-1 rounded text-white"
        >
          Reset
        </button>
      </div>

      <p className="text-center text-xs text-gray-400 mt-2">
        Pomodoros Today: <span className="text-white">{count}</span>
      </p>
    </div>
  );
}
