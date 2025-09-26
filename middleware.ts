// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // Check if the request is for admin dashboard
  if (request.nextUrl.pathname.startsWith("/admin/dashboard")) {
    // Check for authentication cookie
    const authCookie = request.cookies.get("admin-auth");
    
    if (!authCookie || authCookie.value !== "authenticated") {
      // Redirect to admin login page
      return NextResponse.redirect(new URL("/admin", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/dashboard/:path*"]
};