import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  /**
   * Interim. The map moved to /explore and the personalised homepage that will
   * live at / is not built yet, so / forwards there rather than 404ing.
   *
   * 307, not 308: this is temporary by construction, and a cached permanent
   * redirect on the site's root would outlive the homepage landing and be
   * remarkably annoying to undo in every visitor's browser.
   *
   * Delete this the moment app/page.tsx exists again.
   */
  redirects: async () => [
    { source: '/', destination: '/explore', permanent: false },
  ],
  headers: async () => [
    {
      source: '/(.*)',
      headers: [
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'X-Frame-Options', value: 'DENY' },
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      ],
    },
  ],
};

export default nextConfig;
