import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const publicPaths = ["/", "/login", "/register", "/forgot-password", "/reset-password", "/verify-email", "/setup-password", "/verify-uttp", "/privacy-policy", "/terms-and-conditions", "/api/webhooks", "/api/cron", "/api/verify", "/api/files", "/api/plans"];

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public paths
  if (publicPaths.some((path) => pathname === path || pathname.startsWith(path + "/"))) {
    return NextResponse.next();
  }

  // Allow webhooks and cron
  if (pathname.startsWith("/api/webhooks") || pathname.startsWith("/api/cron")) {
    return NextResponse.next();
  }

  // Allow static files and API auth
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/auth") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const session = await auth();

  // Redirect unauthenticated users to login
  if (!session) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const { role } = session.user;

  // Super Admin routes
  if (pathname.startsWith("/admin")) {
    if (role !== "SUPER_ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  // Dashboard routes - require organization membership (except SUPER_ADMIN)
  if (pathname.startsWith("/dashboard")) {
    if (role === "SUPER_ADMIN" && !session.user.organizationId) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
  }

  // User management - only ORGANIZATION_OWNER and SUPER_ADMIN
  if (pathname.startsWith("/dashboard/users")) {
    if (role !== "ORGANIZATION_OWNER" && role !== "SUPER_ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  // Template editing - only ORGANIZATION_OWNER and ADMIN_INSTANSI
  if (pathname.startsWith("/dashboard/templates")) {
    if (role === "STAFF" || role === "VIEWER") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  // Subscription management - only ORGANIZATION_OWNER
  if (pathname.startsWith("/dashboard/subscription")) {
    if (role !== "ORGANIZATION_OWNER" && role !== "SUPER_ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  // Settings - only ORGANIZATION_OWNER
  if (pathname.startsWith("/dashboard/settings")) {
    if (role !== "ORGANIZATION_OWNER" && role !== "SUPER_ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
