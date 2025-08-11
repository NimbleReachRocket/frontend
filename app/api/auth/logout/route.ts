export const runtime = "nodejs";
export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { JWT_COOKIE } from "@/lib/auth";
import { cookies } from "next/headers";

export async function POST() {
  const store = await cookies();
  store.set(JWT_COOKIE, "", { httpOnly: true, secure: true, sameSite: "lax", path: "/", maxAge: 0 });
  return NextResponse.json({ ok: true });
}


