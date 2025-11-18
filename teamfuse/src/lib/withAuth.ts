import { NextRequest, NextResponse } from "next/server";
import { verifyAccess } from "@/lib/auth-tokens";
import { sendError } from "./responseHandler";

interface RouteContext<P = Record<string, string>> {
  params: P;
}

export function withAuth<P = Record<string, string>>(
  handler: (
    req: NextRequest,
    user: { id: string; email: string },
    context?: RouteContext<P> // ← strictly typed, optional
  ) => Promise<NextResponse>
) {
  return async function (
    req: NextRequest,
    context?: RouteContext<P> // ← strictly typed, optional
  ) {
    const accessToken =
      req.cookies.get("access_token")?.value ??
      req.headers.get("authorization")?.replace("Bearer ", "");

    if (!accessToken) {
      return sendError("Unauthorized", "UNAUTHORIZED", 401);
    }

    try {
      const { payload } = await verifyAccess(accessToken);

      const user = {
        id: payload.sub as string,
        email: payload.email as string,
      };

      return handler(req, user, context);
    } catch (err) {
      console.error("Authentication error:", err);
      return sendError("Unauthorized", "UNAUTHORIZED", 401);
    }
  };
}
