/* eslint-disable react-hooks/immutability */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";

let socket: any;

interface ChatProps {
  projectId: string;
  members: any[];
  initialMessages: any[];
  currentUserId: string;
}

export default function Chat({
  projectId,
  members,
  initialMessages,
  currentUserId,
}: ChatProps) {
  const [messages, setMessages] = useState(initialMessages);
  const [message, setMessage] = useState("");
  const [recipientId, setRecipientId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  let typingTimeout: any = null;
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!socket) {
      socket = io(process.env.NEXT_PUBLIC_SOCKET_URL!, {
        withCredentials: true,
        path: "/api/socket/io",
      });
    }

    socket.emit("join_chat", { projectId });

    socket.on("chat:new", (msg: any) => {
      setMessages((prev) => {
        if (prev.some((m) => m.id === msg.id)) return prev;
        return [...prev, msg];
      });
    });

    socket.on("chat:typing", ({ userId }: { userId: string }) => {
      if (userId !== currentUserId) setIsTyping(true);
    });

    socket.on("chat:stop_typing", ({ userId }: { userId: string }) => {
      if (userId !== currentUserId) setIsTyping(false);
    });

    return () => {
      socket.off("chat:new");
      socket.off("chat:typing");
      socket.off("chat:stop_typing");
    };
  }, [projectId, currentUserId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function loadMessages(target: string | null) {
    const url = target
      ? `/api/projects/${projectId}/chat/messages?recipient=${target}`
      : `/api/projects/${projectId}/chat/messages`;

    const res = await fetch(url);
    const data = await res.json();
    if (data.success) setMessages(data.data);
  }

  async function sendMessage() {
    if (!message.trim()) return;

    setLoading(true);

    const res = await fetch(`/api/projects/${projectId}/chat/send`, {
      method: "POST",
      body: JSON.stringify({
        message,
        recipientId,
      }),
    });

    const data = await res.json();
    setLoading(false);

    if (data.success) {
      setMessages((prev) => [...prev, data.data]);

      socket.emit("chat:send", {
        projectId,
        message: data.data,
      });

      setMessage("");
    }
  }

  function handleTyping(e: any) {
    setMessage(e.target.value);

    if (!socket) return;

    socket.emit("chat:typing", {
      userId: currentUserId,
      projectId,
    });

    if (typingTimeout) clearTimeout(typingTimeout);

    typingTimeout = setTimeout(() => {
      socket.emit("chat:stop_typing", {
        userId: currentUserId,
        projectId,
      });
    }, 700);
  }

  const handleKeyPress = (e: any) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const selectedMember = members.find((m) => m.user.id === recipientId);

  return (
    <div className="flex h-screen bg-[#1a1d24] overflow-hidden">
      {/* LEFT SIDEBAR */}
      <div className="w-80 bg-[#151820] border-r border-gray-800/30 flex flex-col">
        {/* SIDEBAR HEADER */}
        <div className="p-6 border-b border-gray-800/30">
          <h2 className="text-lg font-semibold text-gray-200 mb-4">
            Conversations
          </h2>

          {/* SEARCH */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search members..."
              className="w-full bg-[#1e2229] border border-gray-700/30 rounded-lg px-4 py-2.5 pl-10 text-sm text-gray-300 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-600 focus:border-gray-600"
            />
            <svg
              className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>

        {/* MEMBERS LIST */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2 scrollbar-thin scrollbar-thumb-gray-700">
          {/* EVERYONE BUTTON */}
          <button
            onClick={() => {
              setRecipientId(null);
              loadMessages(null);
            }}
            className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all ${
              recipientId === null
                ? "bg-gray-700/20 border border-gray-600/30"
                : "hover:bg-gray-800/30"
            }`}
          >
            <div
              className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                recipientId === null
                  ? "bg-gray-700/50 text-gray-300"
                  : "bg-gray-800/50 text-gray-400"
              }`}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z"
                />
              </svg>
            </div>
            <div className="flex-1 text-left">
              <h3 className="font-medium text-sm text-gray-200">Everyone</h3>
              <p className="text-xs text-gray-500">{members.length} members</p>
            </div>
          </button>

          {/* INDIVIDUAL MEMBERS */}
          {members
            .filter((m) => m.user.id !== currentUserId)
            .map((m) => (
              <button
                key={m.user.id}
                onClick={() => {
                  setRecipientId(m.user.id);
                  loadMessages(m.user.id);
                }}
                className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all ${
                  recipientId === m.user.id
                    ? "bg-gray-700/20 border border-gray-600/30"
                    : "hover:bg-gray-800/30"
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center font-semibold text-sm ${
                    recipientId === m.user.id
                      ? "bg-gray-700/50 text-gray-200"
                      : "bg-gray-800/50 text-gray-400"
                  }`}
                >
                  {m.user.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 text-left">
                  <h3 className="font-medium text-sm text-gray-200">
                    {m.user.name}
                  </h3>
                  <p className="text-xs text-gray-500">Direct message</p>
                </div>
              </button>
            ))}
        </div>
      </div>

      {/* MAIN CHAT AREA */}
      <div className="flex-1 flex flex-col">
        {/* CHAT HEADER */}
        <div className="bg-[#151820] border-b border-gray-800/30 px-6 py-4 flex items-center gap-3">
          {recipientId ? (
            <>
              <div className="w-10 h-10 rounded-lg bg-gray-700/50 flex items-center justify-center font-semibold text-sm text-gray-200">
                {selectedMember?.user.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h1 className="text-base font-semibold text-gray-200">
                  {selectedMember?.user.name}
                </h1>
                <p className="text-xs text-gray-500 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                  Active now
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="w-10 h-10 rounded-lg bg-gray-700/50 flex items-center justify-center text-gray-300">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z"
                  />
                </svg>
              </div>
              <div>
                <h1 className="text-base font-semibold text-gray-200">
                  Team Chat
                </h1>
                <p className="text-xs text-gray-500">
                  {members.length} members
                </p>
              </div>
            </>
          )}
        </div>

        {/* MESSAGES */}
        <div className="flex-1 overflow-y-auto px-8 py-6 space-y-4 scrollbar-thin scrollbar-thumb-gray-700">
          {messages.map((msg) => {
            const isCurrentUser = msg.sender?.id === currentUserId;

            return (
              <div
                key={msg.id}
                className={`flex ${
                  isCurrentUser ? "justify-end" : "justify-start"
                } gap-3`}
              >
                {!isCurrentUser && (
                  <div className="w-8 h-8 rounded-lg bg-gray-700/50 flex items-center justify-center font-semibold text-xs text-gray-300">
                    {msg.sender?.name.charAt(0).toUpperCase()}
                  </div>
                )}

                <div
                  className={`max-w-md flex flex-col gap-1 ${
                    isCurrentUser ? "items-end" : "items-start"
                  }`}
                >
                  <div className="text-xs text-gray-500">
                    {msg.sender?.name}
                    {msg.recipient && (
                      <span className="text-gray-600">
                        {" "}
                        → {msg.recipient.name}
                      </span>
                    )}
                  </div>

                  <div
                    className={`px-4 py-2.5 rounded-lg ${
                      isCurrentUser
                        ? "bg-blue-600 text-white"
                        : "bg-[#242831] text-gray-200"
                    }`}
                  >
                    {msg.message}
                  </div>
                </div>

                {isCurrentUser && (
                  <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-semibold text-xs text-white">
                    {msg.sender?.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
            );
          })}

          {isTyping && (
            <div className="flex gap-3 items-end">
              <div className="w-8 h-8 rounded-lg bg-gray-700/50 flex items-center justify-center text-gray-400 text-xs">
                •••
              </div>
              <div className="px-4 py-2.5 rounded-lg bg-[#242831] flex gap-1.5">
                <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce"></div>
                <div
                  className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce"
                  style={{ animationDelay: "0.1s" }}
                ></div>
                <div
                  className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce"
                  style={{ animationDelay: "0.2s" }}
                ></div>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* INPUT AREA */}
        <div className="p-4 bg-[#151820] border-t border-gray-800/30">
          <div className="flex items-end gap-2">
            <div className="flex-1 relative">
              <textarea
                className="w-full bg-[#1e2229] border border-gray-700/30 rounded-lg px-4 py-3 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-600 focus:border-gray-600 resize-none"
                placeholder={
                  recipientId
                    ? "Send a private message..."
                    : "Message the team..."
                }
                value={message}
                onChange={handleTyping}
                onKeyPress={handleKeyPress}
                rows={1}
              />
            </div>

            <button
              onClick={sendMessage}
              disabled={loading || !message.trim()}
              className="px-4 py-3 bg-blue-600 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors"
            >
              {loading ? (
                <svg
                  className="w-5 h-5 animate-spin"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  ></path>
                </svg>
              ) : (
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
