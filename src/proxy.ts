import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const publicPaths = [
  "/auth/login",
  "/auth/register",
  "/auth/error",
  "/auth/telegram-miniapp",
  "/offline",
  "/pricing",
  "/docs/api",
  "/opengraph-image",
  "/twitter-image",
  "/api/auth",
  "/api/cron",
  "/api/sms",
  "/features",
  "/api/telegram",
];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Landing page (root) is public for everyone
  if (pathname === "/") {
    return NextResponse.next();
  }

  // Allow public paths
  const isPublic = publicPaths.some((p) => pathname.startsWith(p));

  // Allow static assets and Next.js internals
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.includes(".") // static files
  ) {
    return NextResponse.next();
  }

  // Get session
  const session = await auth();

  if (isPublic) {
    // Redirect authenticated users away from auth pages
    if (session && pathname.startsWith("/auth/")) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return NextResponse.next();
  }

  // Redirect unauthenticated users to landing page
  if (!session) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|manifest.json|icons/).*)",
  ],
};
