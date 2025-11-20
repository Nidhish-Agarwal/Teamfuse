import Sidebar from "@/components/project/Sidebar";
import PresenceWidget from "@/components/project/PresenceWidget";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { verifyAccess } from "@/lib/auth-tokens";

interface LayoutProps {
  children: React.ReactNode;
  params: { id: string };
}

export default async function ProjectLayout({ children, params }: LayoutProps) {
  // ✅ Properly await the params Promise
  const { id: projectId } = params;
  const cookieStore = await cookies();

  // const session = await getServerSession(authOptions);
  const accessToken = cookieStore.get("access_token")?.value;
  if (!accessToken) {
    console.log("No access token found, redirecting to auth");
    redirect("/auth");
  }
  const { payload } = await verifyAccess(accessToken);

  // Redirect if no session
  // if (!session?.user) {
  //   console.log("No session found, redirecting to auth");
  //   redirect("/auth");
  // }

  return (
    <div className="flex h-screen bg-gray-950 text-white">
      {/* LEFT SIDEBAR */}
      <Sidebar projectId={projectId} />

      {/* MAIN CONTENT */}
      <main className="flex-1 overflow-auto">{children}</main>

      {/* RIGHT PRESENCE SIDEBAR */}
      <aside className="hidden xl:block w-80 border-l border-gray-800 p-4 overflow-y-auto">
        <PresenceWidget projectId={projectId} currentUserId={payload.sub!} />
      </aside>
    </div>
  );
}
