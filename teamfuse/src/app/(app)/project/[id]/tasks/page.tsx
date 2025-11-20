export default function TasksPage() {
  return (
    <div className="max-w-6xl mx-auto space-y-6 text-white">
      <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
        Task Space
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        <div className="p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xl shadow-lg shadow-purple-500/10">
          <h2 className="text-lg font-semibold mb-3 text-purple-300">To Do</h2>
          <div className="space-y-3">
            <div className="p-3 rounded-lg bg-white/10 border border-white/10">Task #1</div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xl shadow-lg shadow-indigo-500/10">
          <h2 className="text-lg font-semibold mb-3 text-indigo-300">In Progress</h2>
          <div className="space-y-3">
            <div className="p-3 rounded-lg bg-white/10 border border-white/10">Task #2</div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xl shadow-lg shadow-green-500/10">
          <h2 className="text-lg font-semibold mb-3 text-green-300">Completed</h2>
          <div className="space-y-3">
            <div className="p-3 rounded-lg bg-white/10 border border-white/10">Task #3</div>
          </div>
        </div>

      </div>
    </div>
  );
}
