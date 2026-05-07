import { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";

const BASE = "https://olliedoesis.dev";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient();

  const { data: contests } = await supabase
    .from("contests")
    .select("week_number, created_at")
    .eq("status", "archived")
    .order("week_number", { ascending: false });

  const archiveUrls: MetadataRoute.Sitemap = (contests ?? []).map((c) => ({
    url: `${BASE}/archive/${c.week_number}`,
    lastModified: new Date(c.created_at),
    changeFrequency: "never",
    priority: 0.6,
  }));

  return [
    { url: BASE, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${BASE}/archive`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE}/leaderboard`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE}/privacy`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE}/terms`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
    ...archiveUrls,
  ];
}
