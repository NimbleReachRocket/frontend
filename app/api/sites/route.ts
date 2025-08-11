export const runtime = "nodejs";
export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

const createSchema = z.object({
  name: z.string().min(2),
  url: z.string().url(),
});

export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const sites = await prisma.site.findMany({ where: { ownerId: user.id }, orderBy: { createdAt: "desc" } });
  return NextResponse.json(sites);
}

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const { name, url } = createSchema.parse(await request.json());
    const site = await prisma.site.create({ data: { name, url, ownerId: user.id } });
    return NextResponse.json(site);
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}


