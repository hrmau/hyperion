import { promises as fs } from 'node:fs';
import path from 'node:path';
import { ImageResponse } from 'next/og';
import { loadProfile, publishableIso3 } from '@/lib/facts';
import { fuelShares } from '@/lib/fuels';
import type { Fuel } from '@/lib/fuels';

/**
 * A share card per country, rather than the one card for all 200.
 *
 * The point of the country pages is that each leads with a different kind of
 * claim; sharing all of them as the same picture threw that away at exactly the
 * moment someone was passing the link on. This card carries the country's own
 * hook and its own mix.
 *
 * Built at build time, like everything else that reads `public/data`.
 *
 * `public/og_country.png` is the artwork with its copy removed, supplied for
 * this purpose - the card composites text over it rather than redrawing the
 * pattern, so it cannot drift from `og.png`. That file keeps its own text and
 * stays the default for every page that is not a country.
 */

export const size = { width: 1200, height: 628 };
export const contentType = 'image/png';
export const alt = 'Grid Gorilla country profile';

export async function generateStaticParams() {
  const codes = await publishableIso3();
  return codes.map((iso3) => ({ iso3: iso3.toLowerCase() }));
}

/**
 * Satori reads TTF and OTF and cannot read WOFF2, which is all `next/font`
 * produces - so the two families are committed as TTF under `assets/fonts`,
 * outside `public` because nothing should serve them to a browser. Both are
 * SIL OFL 1.1, which permits redistribution; see the licence beside them.
 *
 * The alternative was Satori's fallback face, which would have made the country
 * cards visibly a different product from the site they link to.
 */
const FONT_DIR = path.join(process.cwd(), 'assets', 'fonts');
const asset = (dir: string, file: string) => fs.readFile(path.join(dir, file));

/**
 * Read once per worker, not once per country.
 *
 * This route runs 200 times at build time, and the fonts and the plate are the
 * same every time - 309KB of file reads and a base64 encode of the plate,
 * repeated 200 times, for four bytes of variation. Held as a module-scope
 * promise so each build worker pays for it once.
 */
const chrome = (async () => {
  const [grotesk, groteskBold, mono, plate] = await Promise.all([
    asset(FONT_DIR, 'SpaceGrotesk-Medium.ttf'),
    asset(FONT_DIR, 'SpaceGrotesk-Bold.ttf'),
    asset(FONT_DIR, 'IBMPlexMono-Medium.ttf'),
    fs.readFile(path.join(process.cwd(), 'public', 'og_country.png')),
  ]);
  return {
    background: `data:image/png;base64,${plate.toString('base64')}`,
    fonts: [
      { name: 'Grotesk', data: grotesk, weight: 500 as const, style: 'normal' as const },
      { name: 'Grotesk', data: groteskBold, weight: 700 as const, style: 'normal' as const },
      { name: 'Mono', data: mono, weight: 500 as const, style: 'normal' as const },
    ],
  };
})();

/** Literal hex, not the `var(--fuel-*)` in lib/fuels: Satori resolves no custom properties. */
const FUEL_HEX: Record<Fuel, string> = {
  wind: '#00c758',
  solar: '#9fd8b4',
  other: '#8ba3a3',
  hydro: '#7d9d9a',
  nuclear: '#506b67',
  gas: '#3a595b',
  oil: '#3a4447',
  coal: '#2e3639',
};

const PAPER = '#eef2f2';
const INK = '#0f1416';

export default async function Image({ params }: { params: Promise<{ iso3: string }> }) {
  const { iso3 } = await params;
  const profile = await loadProfile(iso3);

  const { background, fonts } = await chrome;

  // A country with no profile cannot happen through generateStaticParams, but
  // the route is reachable, and an OG image that throws is a broken share card.
  if (!profile) {
    return new ImageResponse(
      (
        <div style={{ ...frame(background), justifyContent: 'center' }}>
          <div style={{ fontFamily: 'Grotesk', fontWeight: 700, fontSize: 84, color: PAPER }}>
            Grid Gorilla
          </div>
        </div>
      ),
      { ...size, fonts }
    );
  }

  const { facts, data } = profile;
  const shares = fuelShares(data).filter((s) => s.pct > 0);
  const clean = data.aggregates.clean_pct;

  return new ImageResponse(
    (
      <div style={frame(background)}>
        <div
          style={{
            display: 'flex',
            fontFamily: 'Mono',
            fontSize: 21,
            letterSpacing: 4,
            color: 'rgba(238, 242, 242, 0.62)',
          }}
        >
          GRIDGORILLA.APP
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div
            style={{
              display: 'flex',
              fontFamily: 'Grotesk',
              fontWeight: 700,
              fontSize: 78,
              letterSpacing: -2.4,
              lineHeight: 1.02,
              color: PAPER,
            }}
          >
            {facts.name}
          </div>
          <div
            style={{
              display: 'flex',
              maxWidth: 940,
              fontFamily: 'Grotesk',
              fontWeight: 500,
              fontSize: 34,
              lineHeight: 1.34,
              color: 'rgba(238, 242, 242, 0.82)',
            }}
          >
            {facts.hero.headline}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* The page's own mix bar. Same fuels, same order, same fills. */}
          <div style={{ display: 'flex', width: '100%', height: 16, borderRadius: 8, overflow: 'hidden' }}>
            {shares.map((s) => (
              <div key={s.fuel} style={{ width: `${s.pct}%`, background: FUEL_HEX[s.fuel] }} />
            ))}
          </div>
          <div
            style={{
              display: 'flex',
              fontFamily: 'Mono',
              fontSize: 22,
              letterSpacing: 2.6,
              color: 'rgba(238, 242, 242, 0.72)',
            }}
          >
            {`${clean.toFixed(1)}% CLEAN · ${facts.year}`}
          </div>
        </div>
      </div>
    ),
    { ...size, fonts }
  );
}

/**
 * The plate, plus a scrim so text stays legible over the lighter half of it.
 *
 * Light on purpose. The supplied artwork is already dimmed for this, and a
 * heavier gradient - the first attempt ran 0.90 at the left - flattened the
 * pattern and erased the watermark entirely, which left a plain dark rectangle
 * with the brand nowhere on it. At 0.62 the near-white headline still measures
 * about 12:1 over the lightest part of the plate.
 */
function frame(background: string): React.CSSProperties {
  return {
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    padding: '58px 64px',
    backgroundColor: INK,
    backgroundImage: `linear-gradient(105deg, rgba(15,20,22,0.62) 0%, rgba(15,20,22,0.40) 48%, rgba(15,20,22,0.12) 100%), url(${background})`,
    backgroundSize: '1200px 628px',
  };
}
