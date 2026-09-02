import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === 'development';

/**
 * Content Security Policy.
 *
 * The site takes no user input and stores no user content, so the classic
 * injected-payload XSS route barely exists here. What this policy is actually
 * for is bounding what a page may load and where it may talk to: two external
 * origins are legitimate — googletagmanager for the analytics tag, flagcdn for
 * country flags — and nothing else should be reachable.
 *
 * `unsafe-inline` for scripts is a real weakening and worth naming rather than
 * hiding. Next inlines bootstrap scripts, and the alternative is a per-request
 * nonce, which means running middleware on every route rather than just `/`.
 * Given there is no user content to inject, restricting script-src to two hosts
 * is most of the value at none of the cost. Revisit if the site ever accepts
 * input.
 *
 * `unsafe-eval` is development only — Turbopack's HMR needs it, production does
 * not, and shipping it would give back much of what the policy buys.
 */
const csp = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "form-action 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ''} https://www.googletagmanager.com`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://flagcdn.com https://www.googletagmanager.com https://*.google-analytics.com",
  "font-src 'self' data:",
  "connect-src 'self' https://www.googletagmanager.com https://www.google-analytics.com https://*.google-analytics.com https://*.analytics.google.com",
  "manifest-src 'self'",
  'upgrade-insecure-requests',
].join('; ');

const nextConfig: NextConfig = {
  poweredByHeader: false,
  headers: async () => [
    {
      /**
       * Keep the site out of the index on every host but its own.
       *
       * hyperion-bice.vercel.app serves a complete, crawlable copy of all 419
       * pages - 200, Allow: /, no robots header - and so does every preview
       * deployment. The canonical tag points at gridgorilla.app, but a canonical
       * is a hint rather than a directive, and this site's whole search case
       * rests on 200 country pages that are similar to each other by design.
       * A second full copy of them on another host is the one duplicate-content
       * risk worth pre-empting.
       *
       * noindex rather than a robots.txt disallow, deliberately: a disallow
       * stops the crawl before the directive is ever read, which can leave the
       * URL indexed with no way to remove it. Let the crawler in, tell it no.
       */
      source: '/(.*)',
      has: [{ type: 'host', value: '.*\\.vercel\\.app' }],
      headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }],
    },
    {
      source: '/(.*)',
      headers: [
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'X-Frame-Options', value: 'DENY' },
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        { key: 'Content-Security-Policy', value: csp },
        // Nothing here needs a camera, a microphone, a location or a payment
        // handler. Denying them outright means a future dependency cannot
        // quietly start asking.
        {
          key: 'Permissions-Policy',
          value:
            'accelerometer=(), autoplay=(), camera=(), display-capture=(), encrypted-media=(), fullscreen=(self), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), midi=(), payment=(), usb=(), xr-spatial-tracking=()',
        },
        // Strict-Transport-Security is deliberately absent: Vercel already
        // serves it at max-age=63072000 on the apex, and a second, weaker
        // header here would be the one that wins.
      ],
    },
  ],
};

export default nextConfig;
