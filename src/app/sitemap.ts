import type { MetadataRoute } from 'next'
import { getAllCases, getFeaturedStories } from '@/lib/queries'

const BASE_URL = 'https://projectrestore.vercel.app'

export const dynamic = 'force-dynamic'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${BASE_URL}/`, lastModified: now, changeFrequency: 'weekly', priority: 1 },
    { url: `${BASE_URL}/cases`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${BASE_URL}/stories`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${BASE_URL}/learn`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE_URL}/timeline`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE_URL}/gallery`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE_URL}/about`, lastModified: now, changeFrequency: 'yearly', priority: 0.5 },
  ]

  let caseRoutes: MetadataRoute.Sitemap = []
  let storyRoutes: MetadataRoute.Sitemap = []

  try {
    const [cases, stories] = await Promise.all([
      getAllCases(),
      getFeaturedStories(),
    ])

    caseRoutes = cases.map((c) => ({
      url: `${BASE_URL}/cases/${c.id}`,
      lastModified: c.updated_at ? new Date(c.updated_at) : now,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    }))

    storyRoutes = stories.flatMap((s) => [
      {
        url: `${BASE_URL}/stories/${s.slug}`,
        lastModified: now,
        changeFrequency: 'monthly' as const,
        priority: 0.7,
      },
      {
        url: `${BASE_URL}/stories/${s.slug}/documents`,
        lastModified: now,
        changeFrequency: 'monthly' as const,
        priority: 0.5,
      },
    ])
  } catch {
    // fall back to static routes only
  }

  return [...staticRoutes, ...caseRoutes, ...storyRoutes]
}
