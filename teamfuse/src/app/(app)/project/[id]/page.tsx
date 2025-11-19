// src/app/project/[id]/page.tsx
import { redirect } from "next/navigation";

export default function ProjectIndex({ params }: { params: { id: string } }) {
  redirect(`/projects/${params.id}/overview`);
}
