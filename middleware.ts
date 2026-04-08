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

    // Lista de correos permitidos — agregar más separados por coma en la variable de entorno
    // ALLOWED_EMP_EMAILS=juan.perez@sucursal.com,marcosteven0717@gmail.com
    const allowedEmails = (
      process.env.ALLOWED_EMP_EMAILS ||
      "juan.perez@sucursal.com,marcosteven0717@gmail.com"
    )
      .split(",")
      .map((e) => e.trim().toLowerCase());

    if (!body || !emailemp || !allowedEmails.includes(emailemp.toLowerCase())) {
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