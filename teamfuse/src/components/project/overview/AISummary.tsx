/* eslint-disable @typescript-eslint/no-explicit-any */
export default function AISummary({ insight }: { insight: any }) {
  if (!insight) {
    return (
      <section className="p-6 bg-gray-900 border border-gray-800 rounded-xl">
        <p className="text-gray-400">No AI summary generated yet.</p>
      </section>
    );
  }

  return (
    <section className="p-6 bg-gray-900 border border-gray-800 rounded-xl">
      <h2 className="text-xl font-bold mb-2">AI Summary</h2>
      <p className="text-gray-300">{insight.summary}</p>
    </section>
  );
}
