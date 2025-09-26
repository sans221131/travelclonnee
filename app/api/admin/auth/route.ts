// app/api/admin/auth/route.ts
import { NextRequest, NextResponse } from "next/server";

const ADMIN_USERNAME = "travel.leafwaysoln";
const ADMIN_PASSWORD = "Wetravelaroundtheworld";

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      // Create response with authentication cookie
      const response = NextResponse.json({ success: true });
      
      response.cookies.set("admin-auth", "authenticated", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 24 * 60 * 60, // 24 hours
        path: "/",
      });

      return response;
    } else {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error("Auth error:", error);
    return NextResponse.json(
      { error: "Authentication failed" },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    // Clear authentication cookie
    const response = NextResponse.json({ success: true });
    response.cookies.delete("admin-auth");
    
    return response;
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json(
      { error: "Logout failed" },
      { status: 500 }
    );
  }
}