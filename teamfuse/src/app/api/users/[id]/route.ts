/* eslint-disable @typescript-eslint/no-explicit-any */
import { prisma } from "../../../../lib/prisma";
import { sendSuccess, sendError } from "@/lib/responseHandler";

// GET /api/users/[id]
export async function GET(
  _: Request,
  context: { params: Promise<Record<string, string>> }
) {
  try {
    const { id } = await context.params;

    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        memberships: { include: { project: true } },
        projectsCreated: true,
        tasks: true,
      },
    });

    if (!user) {
      return sendError("User not found", "NOT_FOUND", 404);
    }

    return sendSuccess(user, "User fetched successfully");
  } catch (error: any) {
    return sendError(error.message, "FETCH_ERROR", 500, error);
  }
}

// PUT /api/users/[id]
export async function PUT(
  request: Request,
  context: { params: Promise<Record<string, string>> }
) {
  try {
    const { id } = await context.params;

    const data = await request.json();

    const updated = await prisma.user.update({
      where: { id },
      data,
    });

    return sendSuccess(updated, "User updated successfully");
  } catch (error: any) {
    return sendError(error.message, "UPDATE_ERROR", 500, error);
  }
}

// DELETE /api/users/[id]
export async function DELETE(
  _: Request,
  context: { params: Promise<Record<string, string>> }
) {
  try {
    const { id } = await context.params;

    await prisma.user.delete({ where: { id } });

    return sendSuccess(null, "User deleted successfully");
  } catch (error: any) {
    return sendError(error.message, "DELETE_ERROR", 500, error);
  }
}
