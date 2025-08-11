export const runtime = "nodejs";
export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { generateSessionToken, hashPassword, JWT_COOKIE } from "@/lib/auth";
import { cookies } from "next/headers";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const { email, password, name } = schema.parse(json);

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "Email already in use" }, { status: 400 });
    }

    const passwordHash = await hashPassword(password);
    const user = await prisma.user.create({ data: { email, name, passwordHash } });
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


