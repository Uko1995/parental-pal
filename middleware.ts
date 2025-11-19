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

/**
 * Add security headers to response
 */
function addSecurityHeaders(response: NextResponse, request: NextRequest): NextResponse {
  // Content Security Policy - tightened to remove unsafe-inline/unsafe-eval where possible
  response.headers.set(
    "Content-Security-Policy",
    "default-src 'self'; " +
      "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://accounts.google.com https://www.googletagmanager.com https://js.paystack.co; " +
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
      "font-src 'self' https://fonts.gstatic.com; " +
      "img-src 'self' data: https: blob:; " +
      "connect-src 'self' https://accounts.google.com https://api.cloudinary.com https://api.paystack.co; " +
      "frame-src 'self' https://accounts.google.com https://js.paystack.co; " +
      "object-src 'none'; " +
      "base-uri 'self'; " +
      "form-action 'self';"
  );

  // Strict Transport Security - Force HTTPS
  response.headers.set(
    "Strict-Transport-Security",
    "max-age=31536000; includeSubDomains; preload"
  );

  // Prevent clickjacking
  response.headers.set("X-Frame-Options", "DENY");

  // Prevent MIME type sniffing
  response.headers.set("X-Content-Type-Options", "nosniff");

  // XSS Protection
  response.headers.set("X-XSS-Protection", "1; mode=block");

  // Referrer Policy
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  // Permissions Policy
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=()"
  );

  // CSRF Protection: Verify origin header for state-changing requests
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method)) {
    const origin = request.headers.get('origin');
    const host = request.headers.get('host');
    
    // Allow requests from same origin or if origin is not set (non-browser requests)
    if (origin && host && !origin.includes(host)) {
      console.warn(`CSRF: Origin mismatch - origin: ${origin}, host: ${host}`);
      // Return 403 for suspicious cross-origin requests
      return NextResponse.json({ error: "Forbidden - Invalid origin" }, { status: 403 });
    }
  }

  return response;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public routes and API auth routes
  if (publicRoutes.some((route) => pathname.startsWith(route))) {
    const response = NextResponse.next();
    return addSecurityHeaders(response, request);
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
      const response = NextResponse.next();
      return addSecurityHeaders(response, request);
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
        const response = NextResponse.next();
        return addSecurityHeaders(response, request);
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
        const response = NextResponse.json(
          { error: "Authentication required" },
          { status: 401 }
        );
        return addSecurityHeaders(response, request);
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
        const response = NextResponse.json(
          { error: "Authentication required" },
          { status: 401 }
        );
        return addSecurityHeaders(response, request);
      }
    }
  }

  const response = NextResponse.next();
  return addSecurityHeaders(response, request);
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
