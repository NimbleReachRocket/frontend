export const runtime = "nodejs";
export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { generateSessionToken, verifyPassword, JWT_COOKIE } from "@/lib/auth";
import { cookies } from "next/headers";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const { email, password } = schema.parse(json);

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }
    const ok = await verifyPassword(password, user.passwordHash);
    if (!ok) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }
    const token = await generateSessionToken(user.id);
    const store = await cookies();
    store.set(JWT_COOKIE, token, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });
    return NextResponse.json({ id: user.id, email: user.email, name: user.name });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}


