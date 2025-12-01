import { MetadataRoute } from 'next'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'
export const revalidate = 3600 // Revalidate every hour

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://olliedoesis.dev'
  const supabase = await createClient()

  // Get all contests for sitemap
  const { data: contests } = await supabase
    .from('contests')
    .select('id, week_number, year, updated_at, status')
    .order('created_at', { ascending: false })

  const contestUrls: MetadataRoute.Sitemap = (contests || []).map((contest) => ({
    url: `${baseUrl}/archive/${contest.year}/week-${contest.week_number}`,
    lastModified: new Date(contest.updated_at),
    changeFrequency: contest.status === 'active' ? 'daily' : 'monthly',
    priority: contest.status === 'active' ? 0.9 : 0.5,
  }))

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/contest`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/archive`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    ...contestUrls,
  ]
}
