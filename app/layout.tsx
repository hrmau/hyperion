import type { Metadata } from "next";
import { Space_Grotesk, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

// The design system's two families. Loaded through next/font rather than the
// CDN @import in its fonts.css: self-hosted, no third-party request, no layout
// shift. Family names and weights match the system exactly.
const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans-family",
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-mono-family",
  display: "swap",
});
import { OG_IMAGE, TWITTER_CARD } from "@/lib/seo";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import CookieConsent from "@/components/CookieConsent";

export const metadata: Metadata = {
  metadataBase: new URL('https://gridgorilla.app'),
  /**
   * One separator, one brand position, set once.
   *
   * Titles had drifted into three patterns - "Grid Gorilla - tagline",
   * "Page | Grid Gorilla" and "Compare - Grid Gorilla" - because each route
   * spelled its own out. A template means a page declares only its own half and
   * cannot get the rest wrong. `absolute` opts out where a page needs full
   * control.
   */
  title: {
    default: 'Grid Gorilla',
    template: '%s | Grid Gorilla',
  },
  description:
    'Electricity generation, energy independence and prosperity for 214 countries. One page per grid: what it burns, how clean it is, and how much of it the country makes itself.',
  alternates: {
    canonical: '/',
  },
  /**
   * Social cards. Only /compare and /country/[iso3] declared these, so every
   * other page - the homepage included - shared as a bare URL with whatever
   * the platform guessed.
   *
   * Only siteName, locale, type and the card format live here. Deliberately no
   * og:title, og:description or og:url: a child route that declares no
   * `openGraph` of its own inherits this block wholesale, so a title here made
   * every page on the site share as "Grid Gorilla" pointing at the homepage -
   * measured on /why before this was cut back. Left out, Next fills og:title
   * from each page's own `title` and og:url from its canonical, which is what
   * was wanted.
   */
  openGraph: {
    type: 'website',
    siteName: 'Grid Gorilla',
    locale: 'en_GB',
    images: [OG_IMAGE],
  },
  twitter: {
    card: TWITTER_CARD,
    images: [OG_IMAGE.url],
  },
  icons: {
    icon: [
      { url: "/icons/favicon-32x32.png", sizes: "32x32", type: "image/png", media: "(prefers-color-scheme: light)" },
      { url: "/icons/favicon-16x16.png", sizes: "16x16", type: "image/png", media: "(prefers-color-scheme: light)" },
      { url: "/icons/favicon-32x32-dark.png", sizes: "32x32", type: "image/png", media: "(prefers-color-scheme: dark)" },
      { url: "/icons/favicon-16x16-dark.png", sizes: "16x16", type: "image/png", media: "(prefers-color-scheme: dark)" },
    ],
    apple: [
      { url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    other: [
      { rel: "mask-icon", url: "/icons/favicon-32x32.png", color: "#1A1A1A" },
    ],
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Grid Gorilla",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // The design system is dark-only by design: its fuel ramp does not invert
    // cleanly, so a light ground would need a second ramp designed for it.
    // `dark` is applied unconditionally — no probe, no toggle, no flash.
    <html
      lang="en"
      className={`dark ${spaceGrotesk.variable} ${plexMono.variable}`}
      suppressHydrationWarning
    >
      <body className="antialiased">
        <GoogleAnalytics />
        {children}
        <CookieConsent />
      </body>
    </html>
  );
}
