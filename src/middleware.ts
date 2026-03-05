import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

const publicPaths = [
  "/auth/login",
  "/auth/register",
  "/auth/error",
  "/offline",
  "/pricing",
  "/opengraph-image",
  "/twitter-image",
  "/api/auth",
  "/api/cron",
  "/api/sms",
  "/api/telegram",
];

export default auth((req) => {
  const { pathname } = req.nextUrl;

  // Landing page (root) is public for everyone
  if (pathname === "/") {
    return NextResponse.next();
  }

  // Allow public paths
  if (publicPaths.some((p) => pathname.startsWith(p))) {
    // Redirect authenticated users away from auth pages
    if (req.auth && pathname.startsWith("/auth/")) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
    return NextResponse.next();
  }

  // Allow static assets and Next.js internals
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.includes(".") // static files
  ) {
    return NextResponse.next();
  }

  // Redirect unauthenticated users to login with callback
  if (!req.auth) {
    const loginUrl = new URL("/auth/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|manifest.json|icons/).*)",
  ],
};
