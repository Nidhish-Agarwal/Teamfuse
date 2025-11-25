"use client";

import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { Timer, Play, Pause, RotateCcw } from "lucide-react";

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

  const start = () => {
    if (running) return;
    setRunning(true);

    // ⭐ Focus → FOCUSED, Break → ONLINE (not IDLE)
    send(isBreak ? "ONLINE" : "FOCUSED");

    ref.current = setInterval(() => {
      setSeconds((prev) => prev - 1);
    }, 1000);
  };

  const pause = () => {
    setRunning(false);
    if (ref.current) clearInterval(ref.current);

    // ⭐ Pause = ONLINE
    send("ONLINE");
  };

  const reset = () => {
    pause();
    setIsBreak(false);
    setSeconds(FOCUS);
  };

  useEffect(() => {
    if (!running) return;
    if (seconds > 0) return;

    if (ref.current) clearInterval(ref.current);

    Promise.resolve().then(() => {
      setRunning(false);

      if (!isBreak) {
        // ⭐ Focus finished → break starts
        setCount((c) => c + 1);
        setIsBreak(true);
        setSeconds(BREAK);

        // ⭐ Break = ONLINE
        send("ONLINE");
      } else {
        // ⭐ Break finished → focus again
        setIsBreak(false);
        setSeconds(FOCUS);

        // ⭐ Focus = FOCUSED
        send("FOCUSED");
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seconds, running, isBreak]);

  const fmt = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(
      2,
      "0"
    )}`;

  const progress = isBreak
    ? ((BREAK - seconds) / BREAK) * 100
    : ((FOCUS - seconds) / FOCUS) * 100;

  return (
    <div className="p-5 rounded-2xl bg-gradient-to-br from-blue-900/20 via-gray-900/50 to-purple-900/20 border border-blue-500/20 backdrop-blur-sm">
      <div className="flex items-center gap-2 mb-4">
        <div className="p-1.5 bg-blue-500/20 rounded-lg border border-blue-500/30">
          <Timer className="w-4 h-4 text-blue-400" />
        </div>
        <h3 className="text-white text-sm font-semibold">Pomodoro Timer</h3>
      </div>

      {/* Circular Progress */}
      <div className="relative w-32 h-32 mx-auto mb-4">
        <svg className="transform -rotate-90 w-32 h-32">
          <circle
            cx="64"
            cy="64"
            r="56"
            stroke="currentColor"
            strokeWidth="8"
            fill="none"
            className="text-gray-700"
          />
          <circle
            cx="64"
            cy="64"
            r="56"
            stroke="currentColor"
            strokeWidth="8"
            fill="none"
            strokeDasharray={`${2 * Math.PI * 56}`}
            strokeDashoffset={`${2 * Math.PI * 56 * (1 - progress / 100)}`}
            className={isBreak ? "text-yellow-400" : "text-blue-400"}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-3xl text-white font-bold">{fmt(seconds)}</div>
          <p className="text-xs text-gray-400 mt-1">
            {isBreak ? "Break Time" : "Focus Time"}
          </p>
        </div>
      </div>

      <div className="flex justify-center gap-2 mb-4">
        {!running ? (
          <button
            onClick={start}
            className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 px-4 py-2 rounded-xl text-white font-medium transition-all shadow-lg shadow-green-500/25"
          >
            <Play className="w-4 h-4" /> Start
          </button>
        ) : (
          <button
            onClick={pause}
            className="flex items-center gap-2 bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-500 hover:to-orange-500 px-4 py-2 rounded-xl text-white font-medium transition-all shadow-lg shadow-yellow-500/25"
          >
            <Pause className="w-4 h-4" /> Pause
          </button>
        )}

        <button
          onClick={reset}
          className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-xl text-white font-medium transition-all border border-gray-600"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      <div className="text-center p-3 rounded-xl bg-white/5 border border-white/10">
        <p className="text-xs text-gray-400">Pomodoros Today</p>
        <p className="text-2xl font-bold text-white">{count}</p>
      </div>
    </div>
  );
}
