"use client";

import { usePathname } from "next/navigation";
import PresenceWidget from "@/components/project/PresenceWidget";

const hiddenRoutes = ["/tasks", "/me/performance", "/team-performance"];

export default function PresenceWrapper({
  projectId,
  currentUserId,
}: {
  projectId: string;
  currentUserId: string;
}) {
  const pathname = usePathname();

  const shouldHide = hiddenRoutes.some((route) => pathname.includes(route));

  if (shouldHide) return null;

  return (
    <aside className="hidden xl:block w-80 border-l border-gray-800 p-4 overflow-visible">
      <PresenceWidget projectId={projectId} currentUserId={currentUserId} />
    </aside>
  );
}
