export default function ChatPage() {
  return (
    <div className="max-w-5xl mx-auto space-y-6 text-white">
      <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
        Chat Space
      </h1>

      <div className="h-[70vh] rounded-xl bg-white/5 backdrop-blur-lg border border-white/10 shadow-xl shadow-indigo-500/10 p-6 flex flex-col justify-between">

        <div className="flex-1 space-y-4 overflow-y-auto pr-2">
          <div className="bg-indigo-600/30 p-3 rounded-xl w-fit shadow-lg backdrop-blur-md">
            hello team 👋
          </div>
          <div className="bg-white/10 p-3 rounded-xl w-fit ml-auto shadow-lg backdrop-blur-md">
            hi! ready to discuss tasks?
          </div>
        </div>

        <div className="mt-4 flex gap-3">
          <input
            className="flex-1 px-4 py-3 rounded-xl bg-white/10 border border-white/20 placeholder-gray-400 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Type your message..."
          />
          <button className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 rounded-xl font-medium">
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
