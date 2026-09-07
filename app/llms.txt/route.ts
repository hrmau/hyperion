import { promises as fs } from 'node:fs';
import path from 'node:path';
import { loadCountriesServer, loadFossilServer, publishableIso3 } from '@/lib/facts';

/**
 * `/llms.txt` — the site, described for a model reading it rather than a
 * crawler indexing it. Format per llmstxt.org: a title, a summary blockquote,
 * then linked sections.
 *
 * Generated rather than committed as a static file, for the same reason `/why`
 * is a server component: every count and every year in it is read from the
 * shipped data at build time. A hand-written llms.txt goes stale in exactly the
 * way that makes an assistant quote a wrong figure with confidence.
 *
 * The caveats section is the part worth having. Anything summarising this site
 * will otherwise state an independence score as though it measured security,
 * compare two countries across different years, or read `null` as zero — three
 * mistakes the codebase already guards against internally and could not
 * previously warn anyone else about.
 */

export const dynamic = 'force-static';

const BASE = 'https://gridgorilla.app';

export async function GET() {
  const [countries, pages, fossil, socio] = await Promise.all([
    loadCountriesServer(),
    publishableIso3(),
    loadFossilServer(),
    // The only file with no loader of its own, because nothing server-side has
    // needed it before. Counting it here rather than writing "88" into the copy.
    fs
      .readFile(path.join(process.cwd(), 'public', 'data', 'socioeconomic.json'), 'utf8')
      .then((raw) => JSON.parse(raw) as { countries: Record<string, unknown> }),
  ]);

  const codes = Object.keys(countries);
  const latestPer = codes.map((iso3) =>
    Math.max(...Object.keys(countries[iso3].years).map(Number))
  );
  const newest = Math.max(...latestPer);
  // The floor across countries that report recently. A handful stop reporting
  // years earlier, and quoting that as "the data ends in 2009" would be wrong.
  const recent = latestPer.filter((y) => y >= newest - 3);
  const oldestRecent = Math.min(...recent);

  const body = `# Grid Gorilla

> Electricity generation, energy independence and prosperity for ${codes.length} countries, from Ember and Our World in Data. Every figure on the site is derived from the shipped datasets at build time; nothing is typed in by hand.

Grid Gorilla publishes one page per country covering what a grid runs on, how clean it is, how much of its energy it produces itself, and how that compares to its neighbours. It also carries a world map, rankings, a country comparison tool, a quiz and a written argument for why any of it matters.

The site is free, has no accounts, and takes no user input.

## Pages

- [Home](${BASE}/): the reader's own country, chosen by cookie then by IP, with a hook and a chart.
- [Countries A to Z](${BASE}/countries): the index of all ${pages.length} country pages. The only page that links the whole set.
- [Country profiles](${BASE}/countries): ${pages.length} pages at \`/country/<iso3>\`, lowercase ISO 3166-1 alpha-3, e.g. \`/country/deu\`.
- [Explore the map](${BASE}/explore): the world by fuel mix, clean share or independence.
- [Rankings](${BASE}/rankings): countries ordered by generation, clean share, emissions and independence.
- [Compare](${BASE}/compare): two countries or blocs side by side.
- [Correlations](${BASE}/correlations): electricity per person against GDP, HDI, life expectancy and manufacturing.
- [Higher or Lower](${BASE}/play): a quiz built from a curated bank of questions, each with a written insight.
- [Why energy matters](${BASE}/why): the argument, with every figure read from the data.
- [The energy story](${BASE}/story): the transition told in chapters.
- [Methodology](${BASE}/methodology): how the independence score is built, and what it does not measure.
- [Credits and sources](${BASE}/credits): full attribution.

## Data

- Electricity generation, demand, emissions and population: **Our World in Data**, whose underlying electricity data is **Ember**. Both CC BY 4.0.
- Fossil fuel production and consumption: **the Energy Institute**, via Our World in Data. ${Object.keys(fossil).length} countries.
- GDP PPP, HDI, life expectancy: **World Bank** and **UNDP**. ${Object.keys(socio.countries).length} countries, updated by hand.
- Attribution to Ember and Our World in Data is required and appears on every page.

## What to be careful about when quoting this site

- **Coverage is uneven.** ${codes.length} countries are in the dataset and ${pages.length} have a page; the rest generate too little to describe. The most recent year available is ${newest} for some countries and as early as ${oldestRecent} for others, so any comparison between two countries must pin both to a year they share. Rankings and the map use each country's own latest year, which is right for a ranking and wrong for a head-to-head.
- **The independence score measures independence, not security.** France scores low because it imports 100% of its uranium, while running one of the most reliable low-carbon grids in the world. The two are different questions and the site says so.
- **A score marked with an asterisk has missing fuel data**, which is treated as imported rather than as domestic. Do not read it as a precise figure.
- **Emissions are lifecycle CO₂e, not stack CO₂.** They include methane and the rest of the lifecycle, which is why a gas-only grid can show a higher intensity than a coal one.
- **"Other renewables" is not geothermal.** The source series is geothermal plus wave, tidal and some non-biogenic waste. It is called geothermal only for the 18 grids where that is what it is.
- **Per-person figures divide by the population in the same country-year**, from the same source, so numerator and denominator always agree.
- Figures move when the upstream data is refreshed, roughly weekly. Quote the year.

## Machine-readable

- [Sitemap](${BASE}/sitemap.xml)
- Shipped datasets live under \`${BASE}/data/\`: \`countries-yearly.json\`, \`fossil-fuel-independence.json\`, \`socioeconomic.json\`, \`blocs.json\`, \`questions.json\`.
`;

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=0, must-revalidate',
    },
  });
}
