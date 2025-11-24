import { AppError } from "../errors/AppError";

export async function checkRepoAccess(
  token: string,
  owner: string,
  repo: string
) {
  const res = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
    },
  });

  if (res.status === 404)
    throw new AppError("Repository not found.", "NOT_FOUND", 404);
  if (res.status === 401)
    throw new AppError("Invalid GitHub access token.", "UNAUTHORIZED", 401);
  if (res.status === 403)
    throw new AppError(
      "GitHub API rate-limited or access blocked.",
      "GITHUB_ERROR",
      403
    );

  const repoData = await res.json();

  const permissions = repoData.permissions;

  if (!permissions) {
    throw new AppError(
      "Unable to verify repository permissions.",
      "GITHUB_ERROR",
      403
    );
  }

  const canWrite =
    permissions.push || permissions.admin || permissions.maintain;

  if (!canWrite) {
    throw new AppError(
      "You do not have write access to this repository",
      "FORBIDDEN",
      403
    );
  }

  return true;
}
