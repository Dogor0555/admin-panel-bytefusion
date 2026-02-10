import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public and internal Next paths without checking
  if (
    pathname.startsWith("/login") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/static") ||
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next();
  }

  // Read cookie header from the incoming request
  const cookieHeader = request.headers.get("cookie") || "";

  // Ensure we have a backend URL configured
  const apiBase = process.env.NEXT_PUBLIC_API_URL;
  if (!apiBase) {
    // If no API base, fail closed and redirect to login
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  try {
    const resp = await fetch(`${apiBase}/auth/check-cookie`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookieHeader,
      },
    });

    if (!resp.ok) {
      const loginUrl = new URL("/login", request.url);
      return NextResponse.redirect(loginUrl);
    }

    const body = await resp.json().catch(() => null);

    // Response shape: { ok: true, user: { emailemp: 'juan.perez@sucursal.com', ... } }
    const emailemp = body?.user?.emailemp ?? body?.emailemp;

    const allowedEmail = process.env.ALLOWED_EMP_EMAIL || "juan.perez@sucursal.com";
    if (!body || !emailemp || emailemp !== allowedEmail) {
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
  // Apply middleware to all routes (we early-return for public/internal ones)
  matcher: ["/:path*"],
};
