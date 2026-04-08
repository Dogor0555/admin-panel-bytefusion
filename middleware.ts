// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public paths
  if (
    pathname.startsWith("/login") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/static") ||
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next();
  }

  // Get the cookie from the request
  const cookieHeader = request.headers.get("cookie") || "";
  
  // Check if the user is authenticated by calling your backend
  const apiBase = process.env.NEXT_PUBLIC_API_URL;
  
  if (!apiBase) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  try {
    const resp = await fetch(`${apiBase}/checkAuth`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Cookie": cookieHeader,
      },
    });

    if (!resp.ok) {
      const loginUrl = new URL("/login", request.url);
      return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
  } catch (e) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }
}

export const config = {
  matcher: ["/:path*"],
};