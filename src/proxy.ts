import { getSessionCookie } from "better-auth/cookies";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export function proxy(request: NextRequest) {
  const sessionCookie = getSessionCookie(request, { cookiePrefix: "luma" });
  if (!sessionCookie) {
    const signInUrl = new URL("/sign-in", request.url);
    signInUrl.searchParams.set(
      "callbackURL",
      request.nextUrl.pathname + request.nextUrl.search,
    );
    return NextResponse.redirect(signInUrl);
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/inbox/:path*",
    "/knowledge/:path*",
    "/ai/:path*",
    "/analytics/:path*",
    "/channels/:path*",
    "/team/:path*",
    "/settings/:path*",
  ],
};
