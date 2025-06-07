import { auth } from "@/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  try {
    // Get the session from NextAuth.js
    const session = await auth();

    // Public routes that don't require authentication
    const publicRoutes = [
      "/login",
      "/register",
      "/api/auth",
    ];

    // Check if the current route is public
    const isPublicRoute = publicRoutes.some(route =>
      request.nextUrl.pathname.startsWith(route)
    );

    // If the user is authenticated and trying to access login/register, redirect to dashboard
    if (session?.user && (request.nextUrl.pathname === "/login" || request.nextUrl.pathname === "/register")) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    // If the user is not authenticated and trying to access a protected route, redirect to login
    if (!session?.user && !isPublicRoute) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("callbackUrl", request.nextUrl.pathname);
      return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
  } catch (error) {
    console.error("Error in middleware:", error);
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
