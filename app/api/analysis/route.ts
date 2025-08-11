import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { load as loadHtml } from "cheerio";

const schema = z.object({ siteId: z.number().int().positive() });

async function fetchAndAnalyse(url: string) {
  const res = await fetch(url, { headers: { "User-Agent": "reach-rocket-bot" } });
  const html = await res.text();
  const $ = loadHtml(html);

  const title = $("title").text();
  const description = $('meta[name="description"]').attr("content") || "";
  const h1Count = $("h1").length;
  const wordCount = $("body").text().split(/\s+/).filter(Boolean).length;

  // Toy scoring: weights for demo
  let score = 50;
  if (title) score += 10;
  if (description.length > 50) score += 10;
  if (h1Count >= 1) score += 10;
  if (wordCount > 300) score += 20;
  score = Math.min(100, score);

  const recs: Array<{ title: string; description: string; category?: string }> = [];
  if (!title) recs.push({ title: "Add a descriptive <title>", description: "Include a concise, keyword-rich title.", category: "Meta" });
  if (description.length < 50) recs.push({ title: "Improve meta description", description: "Aim for 150-160 characters summarizing the page.", category: "Meta" });
  if (h1Count < 1) recs.push({ title: "Add an H1 heading", description: "Use a single clear H1 summarizing the content.", category: "Content" });
  if (wordCount < 300) recs.push({ title: "Add more content", description: "Expand content to at least 300 words.", category: "Content" });

  return { score, details: { title, description, h1Count, wordCount }, recs };
}

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const json = await request.json();
  const { siteId } = schema.parse(json);
  const site = await prisma.site.findFirst({ where: { id: siteId, ownerId: user.id } });
  if (!site) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { score, details, recs } = await fetchAndAnalyse(site.url);
  const analysis = await prisma.analysis.create({ data: { siteId: site.id, geoScore: score, details } });
  if (recs.length) {
    await prisma.recommendation.createMany({
      data: recs.map((r) => ({ siteId: site.id, analysisId: analysis.id, title: r.title, description: r.description, category: r.category })),
    });
  }
  return NextResponse.json({ analysisId: analysis.id, geoScore: analysis.geoScore });
}


