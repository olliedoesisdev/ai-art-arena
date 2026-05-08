import { MetadataRoute } from "next";
import { createPublicClient } from "@/lib/supabase/server";
import { SITE_URL } from "@/lib/site";

const BASE = SITE_URL;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createPublicClient();

  const [{ data: contests }, { data: active }] = await Promise.all([
    supabase
      .from("contests")
      .select("week_number, created_at")
      .eq("status", "archived")
      .order("week_number", { ascending: false }),
    supabase
      .from("contests")
      .select("id")
      .eq("status", "active")
      .limit(1)
      .maybeSingle(),
  ]);

  const archiveUrls: MetadataRoute.Sitemap = (contests ?? []).map((c) => ({
    url: `${BASE}/archive/${c.week_number}`,
    lastModified: new Date(c.created_at),
    changeFrequency: "never",
    priority: 0.6,
  }));

  const contestUrls: MetadataRoute.Sitemap = active?.id
    ? [{ url: `${BASE}/contest/${active.id}`, lastModified: new Date(), changeFrequency: "hourly", priority: 0.9 }]
    : [];

  return [
    { url: BASE, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    ...contestUrls,
    { url: `${BASE}/archive`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE}/leaderboard`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE}/privacy`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE}/terms`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
    ...archiveUrls,
  ];
}
