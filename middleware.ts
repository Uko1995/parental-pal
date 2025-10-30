import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Define protected routes
const protectedRoutes = ["/dashboard", "/api/analytics", "/api/dashboard"];

const adminOnlyRoutes = [
  "/dashboard",
  "/dashboard/analytics",
  "/dashboard/tutors",
  "/dashboard/parents",
  "/dashboard/children",
  "/dashboard/bookings",
  "/dashboard/payments",
  "/dashboard/services",
  "/dashboard/blog",
  "/dashboard/settings",
  "/api/analytics",
  "/api/dashboard",
];

const publicRoutes = [
  "/",
  "/about",
  "/services",
  "/tutors",
  "/blog",
  "/auth/signin",
  "/auth/error",
  "/api/auth",
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public routes and API auth routes
  if (publicRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // For Edge Runtime compatibility, we'll use cookies to check session
  const sessionToken =
    request.cookies.get("next-auth.session-token") ||
    request.cookies.get("__Secure-next-auth.session-token");

  // Check if user has session cookie
  const hasSession = !!sessionToken?.value;

  // Check if route requires authentication
  if (protectedRoutes.some((route) => pathname.startsWith(route))) {
    // No session - redirect to sign in
    if (!hasSession) {
      const signInUrl = new URL("/auth/signin", request.url);
      signInUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(signInUrl);
    }

    // For admin-only routes, we'll let the API routes handle the detailed authorization
    // since we can't access user roles in Edge Runtime middleware
    if (adminOnlyRoutes.some((route) => pathname.startsWith(route))) {
      // Just ensure they have a session, detailed role checking happens in API routes
      if (!hasSession) {
        const signInUrl = new URL("/auth/signin", request.url);
        signInUrl.searchParams.set("callbackUrl", pathname);
        return NextResponse.redirect(signInUrl);
      }
    }
  }

  // Check API routes that require authentication
  if (pathname.startsWith("/api/")) {
    // Skip auth API routes
    if (pathname.startsWith("/api/auth/")) {
      return NextResponse.next();
    }

    // Public API routes
    const publicApiRoutes = [
      "/api/services",
      "/api/bookings", // Allow POST for booking creation
      "/api/tutors", // Allow GET for public tutor listing
    ];

    // Check if it's a public API route with GET method
    if (publicApiRoutes.some((route) => pathname.startsWith(route))) {
      if (
        request.method === "GET" ||
        (request.method === "POST" && pathname.startsWith("/api/bookings"))
      ) {
        return NextResponse.next();
      }
    }

    // Admin-only API routes - basic session check
    const adminApiRoutes = [
      "/api/analytics",
      "/api/dashboard",
      "/api/users",
      "/api/parents-data",
      "/api/children-data",
      "/api/tutors-data",
    ];

    if (adminApiRoutes.some((route) => pathname.startsWith(route))) {
      if (!hasSession) {
        return NextResponse.json(
          { error: "Authentication required" },
          { status: 401 }
        );
      }
      // Let the API route itself handle role-based authorization
    }

    // Protected API routes require authentication
    const protectedApiRoutes = ["/api/bookings", "/api/payments", "/api/email"];

    if (protectedApiRoutes.some((route) => pathname.startsWith(route))) {
      if (
        !hasSession &&
        request.method !== "GET" &&
        !(request.method === "POST" && pathname === "/api/bookings")
      ) {
        return NextResponse.json(
          { error: "Authentication required" },
          { status: 401 }
        );
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    "/((?!_next/static|_next/image|favicon.ico|images|.*\\.png$|.*\\.jpg$|.*\\.jpeg$|.*\\.gif$|.*\\.svg$).*)",
  ],
};
