import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import type { Site } from "@prisma/client";

async function getData(): Promise<{ user: { id: number; email: string; name: string | null } | null; sites: Site[] }> {
  const user = await getSessionUser();
  if (!user) return { user: null, sites: [] as Site[] };
  const sites = await prisma.site.findMany({ where: { ownerId: user.id }, orderBy: { createdAt: "desc" } });
  return { user, sites };
}

export default async function DashboardPage() {
  const { user, sites } = await getData();
  if (!user) {
    return (
      <div className="max-w-2xl mx-auto mt-16">
        <h1 className="text-2xl font-semibold mb-4">Welcome</h1>
        <p className="mb-4">Please log in to access your dashboard.</p>
        <div className="flex gap-3">
          <Link className="underline" href="/login">Login</Link>
          <Link className="underline" href="/signup">Sign up</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto mt-8 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Your Sites</h1>
        <CreateSiteButton />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sites.map((s) => (
          <Link key={s.id} href={`/sites/${s.id}`} className="border p-4 rounded hover:bg-neutral-50">
            <div className="font-medium">{s.name}</div>
            <div className="text-sm text-neutral-600">{s.url}</div>
          </Link>
        ))}
        {sites.length === 0 && <p className="text-neutral-600">No sites yet. Create one to get started.</p>}
      </div>
    </div>
  );
}

function CreateSiteButton() {
  return (
    <form action={createSite} className="flex items-center gap-2">
      <input name="name" placeholder="Site name" className="border p-2 rounded" required />
      <input name="url" placeholder="https://example.com" className="border p-2 rounded" required />
      <button className="bg-black text-white px-3 py-2 rounded">Create</button>
    </form>
  );
}

async function createSite(formData: FormData) {
  "use server";
  const name = String(formData.get("name"));
  const url = String(formData.get("url"));
  const user = await getSessionUser();
  if (!user) return;
  await prisma.site.create({ data: { name, url, ownerId: user.id } });
}


