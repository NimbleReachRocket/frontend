import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

const updateSchema = z.object({
  id: z.number().int().positive(),
  status: z.enum(["TODO", "DOING", "DONE"]),
});

export async function PATCH(request: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id, status } = updateSchema.parse(await request.json());

  const rec = await prisma.recommendation.findFirst({ where: { id }, include: { site: true } });
  if (!rec || rec.site.ownerId !== user.id) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const updated = await prisma.recommendation.update({ where: { id }, data: { status } });
  return NextResponse.json(updated);
}


