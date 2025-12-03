import { projectSchema } from "@/lib/validators/validateProjectInput";
import { parseRepoUrl } from "@/lib/github/parseRepoUrl";
import { checkRepoAccess } from "@/lib/github/checkRepoAccess";
import { checkScopes } from "@/lib/github/checkScopes";
import { createProject, isRepoLinked } from "@/lib/db/projectService";
import { inviteExistingUsers } from "@/lib/db/memberService";
import { sendSuccess, sendError } from "@/lib/responseHandler";
import { withAuth } from "@/lib/withAuth";
import { NextRequest } from "next/server";
import { getGitHubToken } from "@/lib/github/getGitHubToken";
import { handleRouteError } from "@/lib/errors/handleRouteError";
import { getAllProjectsForUser } from "@/lib/services/projectServices";
import { ensureGithubWebhookForProject } from "@/lib/github/registerWebhook";

export async function POST(
  req: NextRequest,
  context: { params: Promise<Record<string, string>> }
) {
  await context.params;

  return withAuth(async (req, user) => {
    try {
      const session = await getGitHubToken(user.id);
      if (!session?.accessToken)
        return sendError(
          "Unauthorized — missing GitHub token",
          "UNAUTHORIZED",
          401
        );

      const body = await req.json();
      const { name, description, githubRepo, members } =
        projectSchema.parse(body);

      const { owner, repo } = parseRepoUrl(githubRepo);
      checkScopes(session.scopes);
      await checkRepoAccess(session.accessToken, owner, repo);

      const exists = await isRepoLinked(githubRepo);
      if (exists) {
        return sendError(
          "This repository is already linked to another project.",
          "DUPLICATE_REPO",
          409
        );
      }

      const webhookData = await ensureGithubWebhookForProject(
        session.accessToken,
        owner,
        repo
      );

      const project = await createProject(
        user.id,
        name,
        description,
        githubRepo,
        webhookData
      );

      if (members && members?.length > 0) {
        await inviteExistingUsers(project.id, members);
      }

      return sendSuccess(project, "Project created successfully", 201);
    } catch (err) {
      console.log("Error in POST /api/projects:", err);
      return handleRouteError(err);
    }
  })(req, { params: {} });
}

export async function GET(
  req: NextRequest,
  context: { params: Promise<Record<string, string>> }
) {
  await context.params;

  return withAuth(async (_req: NextRequest, user) => {
    try {
      const { accepted, pending } = await getAllProjectsForUser(user.id);
      return sendSuccess(
        { accepted, pending },
        "Projects fetched successfully"
      );
    } catch (err) {
      console.log("Error in GET /api/projects:", err);
      return handleRouteError(err);
    }
  })(req, { params: {} });
}
