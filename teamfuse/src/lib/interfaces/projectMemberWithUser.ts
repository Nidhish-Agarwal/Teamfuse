import { ProjectMember } from "@prisma/client";

export interface ProjectMemberWithUser extends ProjectMember {
  user: {
    id: string;
    name: string;
  };
}
