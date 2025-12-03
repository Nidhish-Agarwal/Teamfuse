import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyAccess } from "@/lib/auth-tokens";

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const query = req.nextUrl.search;
  let currentPath = path + query;
  if (!currentPath.startsWith("/")) currentPath = "/";

  const redirectUrl = new URL("/auth", req.url);
  redirectUrl.searchParams.set("from", currentPath);

  const access =
    req.cookies.get("access_token")?.value ||
    req.headers.get("authorization")?.replace("Bearer ", "");

  const refresh = req.cookies.get("refresh_token")?.value;

  const nextAuthSession =
    req.cookies.get("next-auth.session-token")?.value ||
    req.cookies.get("__Secure-next-auth.session-token")?.value;

  const isAuthCallback = path.startsWith("/api/auth/callback");

  // ✅ 1. Access token valid
  if (access) {
    try {
      await verifyAccess(access);
      return NextResponse.next();
    } catch (er) {
      console.log("❌ Invalid access token, continue to refresh", er);
    }
  }

  // ✅ 2. Refresh token exists → try refresh
  if (refresh) {
    const refreshRes = await fetch(new URL("/api/auth/refresh", req.url), {
      method: "POST",
      headers: { cookie: req.headers.get("cookie") ?? "" },
    });

    if (refreshRes.ok) {
      const res =
        req.method === "GET" || req.method === "HEAD"
          ? NextResponse.redirect(req.url)
          : NextResponse.next();

      refreshRes.headers.forEach((value, key) => {
        if (key.toLowerCase() === "set-cookie") {
          res.headers.append("set-cookie", value);
        }
      });
      return res;
    }
  }

  // ✅ 3. Only allow NextAuth session during OAuth callback phase
  if (nextAuthSession && isAuthCallback) {
    console.log("✔ Allowing OAuth callback phase");
    return NextResponse.next();
  }

  // ❌ If NextAuth session exists BUT no refresh_token after callback → force login
  if (nextAuthSession && !refresh) {
    console.log(
      "❌ NextAuth session exists but no refresh token → invalid state"
    );
    return NextResponse.redirect(redirectUrl);
  }

  // ❌ 4. Completely unauthenticated
  console.log("⛔ No auth → redirecting to /auth");
  return NextResponse.redirect(redirectUrl);
}

export const config = {
  matcher: [
    "/api/protected/:path*",
    "/api/auth/sessions/:path*",
    "/dashboard/:path*",
    "/projects/:path*",
    "/settings/:path*",
    "/api/projects/:path*",
    "/api/tasks/:path*",
    "/api/messages/:path*",
    "/api/feedback/:path*",
  ],
};
