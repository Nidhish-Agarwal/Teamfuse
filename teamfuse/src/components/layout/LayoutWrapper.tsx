import Header from "./Header";
import Sidebar from "./Sidebar";

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0d0f17] via-[#10121c] to-[#111225] text-white">
      <Header />

      <div className="flex max-w-7xl mx-auto pt-[90px] px-4 gap-6">
        <Sidebar />
        <main className="flex-1 min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
}
