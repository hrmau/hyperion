import type { MetadataRoute } from 'next';

/**
 * The site went from a dozen pages to a couple of hundred with the country
 * profiles, which is the point at which having no robots.txt at all starts to
 * matter. Nothing is disallowed — everything published is meant to be found —
 * but the sitemap reference is what gets the 200 new URLs crawled.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: '*', allow: '/' }],
    sitemap: 'https://gridgorilla.app/sitemap.xml',
    host: 'https://gridgorilla.app',
  };
}
