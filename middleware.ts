import { NextResponse, NextRequest } from "next/server";
import { jwtVerify } from "jose";

const JWT_COOKIE = "geo_session";
const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "dev-secret");

const protectedPaths = ["/dashboard", "/sites"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isProtected = protectedPaths.some((p) => pathname === p || pathname.startsWith(`${p}/`));
  if (!isProtected) return NextResponse.next();

  const token = request.cookies.get(JWT_COOKIE)?.value;
  if (!token) {
    const url = new URL("/login", request.url);
    return NextResponse.redirect(url);
  }
  try {
    await jwtVerify(token, JWT_SECRET);
    return NextResponse.next();
  } catch {
    const url = new URL("/login", request.url);
    return NextResponse.redirect(url);
  }
}

export const config = {
  matcher: ["/dashboard", "/sites/:path*"],
};


