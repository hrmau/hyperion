import type { MetadataRoute } from 'next'
import { loadFacts } from '@/lib/facts'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://gridgorilla.app'

  // One entry per country that has a publishable hook. Countries the fact engine
  // has nothing to say about get no page, so they get no sitemap entry either —
  // listing a URL that 404s is worse than omitting it.
  const facts = await loadFacts()
  const countryPages: MetadataRoute.Sitemap = Object.values(facts).map((c) => ({
    url: `${baseUrl}/country/${c.iso3.toLowerCase()}`,
    // The data year, not the build date: these pages change when the figures do.
    lastModified: new Date(Date.UTC(c.year, 11, 31)),
    changeFrequency: 'monthly',
    priority: 0.7,
  }))

  return [
    ...countryPages,
    // `/` is intentionally absent while it redirects to /explore — a URL that
    // 307s does not belong in a sitemap. It returns at priority 1 with the
    // homepage.
    {
      url: `${baseUrl}/explore`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${baseUrl}/play`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/story`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/rankings`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/correlations`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/compare`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/why`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/methodology`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/credits`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ]
}
