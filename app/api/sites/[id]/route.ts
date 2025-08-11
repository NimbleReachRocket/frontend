import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const siteId = Number(id);
  const site = await prisma.site.findFirst({
    where: { id: siteId, ownerId: user.id },
    include: {
      analyses: { orderBy: { createdAt: "desc" }, take: 5 },
      recommendations: { orderBy: { createdAt: "desc" } },
    },
  });
  if (!site) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(site);
}


