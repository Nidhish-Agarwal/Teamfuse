import Chat from "../../../../../components/project/chat/chat";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import ErrorUnauthorized from "@/components/shared/ErrorUnauthorized";
import ErrorNoAccess from "@/components/shared/ErrorNoAccess";
import ErrorProjectNotFound from "@/components/shared/ErrorProjectNotFound";

export default async function ChatPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: projectId } = await params;

  const session = await getServerSession(authOptions);
  const currentUserId = session?.user?.id;

  if (!currentUserId) {
    return <ErrorUnauthorized />;
  }

  const project = await prisma.project.findUnique({
    where: { id: projectId },
  });

  if (!project) {
    return <ErrorProjectNotFound />;
  }

  const membership = await prisma.projectMember.findFirst({
    where: {
      projectId,
      userId: currentUserId,
      status: "ACCEPTED",
    },
  });

  if (!membership) {
    return <ErrorNoAccess />;
  }

  const members = await prisma.projectMember.findMany({
    where: { projectId, status: "ACCEPTED" },
    include: {
      user: {
        select: { id: true, name: true, avatarUrl: true },
      },
    },
  });

  const messages = await prisma.chatMessage.findMany({
    where: { projectId },
    orderBy: { createdAt: "asc" },
    include: {
      sender: { select: { id: true, name: true, avatarUrl: true } },
    },
  });

  return (
    <div className="h-screen">
      <Chat
        currentUserId={currentUserId}
        projectId={projectId}
        members={members}
        initialMessages={messages}
      />
    </div>
  );
}
