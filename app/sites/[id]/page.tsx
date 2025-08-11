import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

export default async function SiteDetailPage(context: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user) notFound();
  const { id } = await context.params;
  const siteId = Number(id);
  const site = await prisma.site.findFirst({
    where: { id: siteId, ownerId: user.id },
    include: {
      analyses: { orderBy: { createdAt: "desc" }, take: 1 },
      recommendations: { orderBy: { createdAt: "desc" } },
    },
  });
  if (!site) notFound();

  const latest = site.analyses[0] ?? null;
  const groups = {
    TODO: site.recommendations.filter((r) => r.status === "TODO"),
    DOING: site.recommendations.filter((r) => r.status === "DOING"),
    DONE: site.recommendations.filter((r) => r.status === "DONE"),
  } as const;

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{site.name}</h1>
          <div className="text-sm text-neutral-600">{site.url}</div>
        </div>
        <form action={runAnalysis}>
          <input type="hidden" name="siteId" value={site.id} />
          <button className="bg-black text-white px-3 py-2 rounded">Analyse</button>
        </form>
      </div>

      <div className="border rounded p-4">
        <div className="text-sm text-neutral-600">Latest GEO score</div>
        <div className="text-4xl font-bold">{latest ? latest.geoScore : "-"}</div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {(["TODO", "DOING", "DONE"] as const).map((col) => (
          <div key={col} className="border rounded p-4">
            <div className="font-medium mb-2">{col}</div>
            <div className="space-y-2">
              {groups[col].map((rec) => (
                <RecommendationCard key={rec.id} rec={rec} />
              ))}
              {groups[col].length === 0 && <div className="text-sm text-neutral-500">No items</div>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

import type { Recommendation } from "@prisma/client";

function RecommendationCard({ rec }: { rec: Recommendation }) {
  return (
    <form action={updateRec} className="border rounded p-3">
      <div className="font-medium">{rec.title}</div>
      <div className="text-sm text-neutral-600">{rec.description}</div>
      <input type="hidden" name="id" value={rec.id} />
      <select name="status" defaultValue={rec.status} className="border p-1 rounded mt-2">
        <option value="TODO">ToDo</option>
        <option value="DOING">Doing</option>
        <option value="DONE">Done</option>
      </select>
      <button className="ml-2 text-sm px-2 py-1 rounded border">Update</button>
    </form>
  );
}

async function runAnalysis(formData: FormData) {
  "use server";
  const siteId = Number(formData.get("siteId"));
  const user = await getSessionUser();
  if (!user) return;
  const site = await prisma.site.findFirst({ where: { id: siteId, ownerId: user.id } });
  if (!site) return;
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ""}/api/analysis`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ siteId }),
  });
  await res.json();
}

async function updateRec(formData: FormData) {
  "use server";
  const id = Number(formData.get("id"));
  const status = String(formData.get("status"));
  await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ""}/api/recommendations`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, status }),
  });
}


