'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { loadCountries } from '@/lib/data';
import FlagImg from '@/components/FlagImg';
import type { CountriesData, Country } from '@/lib/types';
import { formatPercent } from '@/lib/scales';
import { energyColors } from '@/lib/colors';
import TopNav from '@/components/ds/nav/TopNav';
import SiteFooter from '@/components/ds/nav/SiteFooter';

/**
 * Chapter accents are design-system tokens, not hues.
 *
 * The original eight were amber, red, purple, grey, orange, green, crimson and
 * blue — eight competing hues, which is what the one-hue rule exists to
 * prevent. They are now steps along the single ramp, with clay reserved for the
 * two crisis chapters and green for the one about the transition.
 */
interface Chapter {
  id: string;
  era: string;
  title: string;
  years: string;
  narrative: string[];
  highlight?: string; // ISO3 country to highlight
  showCountries?: string[]; // Countries to show data for
  dataYear?: number; // Year to pull data from
  color: string;
}

const chapters: Chapter[] = [
  {
    id: 'abundance',
    era: 'Chapter 1',
    title: 'The Age of Abundance',
    years: '1950s-1960s',
    narrative: [
      'The post-war economic boom was powered by cheap oil and expanding electricity grids.',
      'For the first time, the correlation between energy consumption and prosperity became unmistakably clear.',
      'Oil cost just $3 per barrel. Economies grew at 4-6% annually. The future seemed limitless.',
    ],
    color: 'var(--scale-5)',
  },
  {
    id: 'oil-crisis',
    era: 'Chapter 2',
    title: 'The 1973 Oil Crisis',
    years: '1973-1974',
    narrative: [
      'OPEC\'s embargo proved that energy is a weapon. Oil prices quadrupled overnight.',
      'Economies that seemed invincible suddenly looked vulnerable. Gas lines stretched for miles.',
      'The world learned a harsh lesson: dependence on foreign energy is a strategic weakness.',
    ],
    color: 'var(--clay)',
  },
  {
    id: 'nuclear-bet',
    era: 'Chapter 3',
    title: 'France\'s Nuclear Bet',
    years: '1970s-1980s',
    narrative: [
      'After the oil crisis, France made a bold decision: go all-in on nuclear power.',
      'By the 1980s, over 70% of French electricity came from nuclear. Energy independence achieved.',
      'French electricity prices became among the lowest in Europe. The bet paid off.',
    ],
    highlight: 'FRA',
    showCountries: ['FRA', 'DEU'],
    dataYear: 2024,
    color: 'var(--scale-4)',
  },
  {
    id: 'chernobyl',
    era: 'Chapter 4',
    title: 'Chernobyl\'s Shadow',
    years: '1986',
    narrative: [
      'April 26, 1986. A single accident at Chernobyl shifted global nuclear policy for decades.',
      'Some countries doubled down on nuclear. Others began planning their exit.',
      'Germany\'s eventual decision to phase out nuclear power traces back to this moment.',
    ],
    color: 'var(--scale-2)',
  },
  {
    id: 'fracking',
    era: 'Chapter 5',
    title: 'The Fracking Revolution',
    years: '2008-2019',
    narrative: [
      'The United States unlocked shale oil and gas, transforming from importer to exporter.',
      'Natural gas prices collapsed from $13 to $3 per MMBtu. Manufacturing returned to America.',
      'U.S. oil production more than doubled in a decade. The geopolitical implications were massive.',
    ],
    highlight: 'USA',
    showCountries: ['USA', 'RUS', 'SAU'],
    dataYear: 2019,
    color: 'var(--scale-3)',
  },
  {
    id: 'energiewende',
    era: 'Chapter 6',
    title: 'Germany\'s Green Gamble',
    years: '2011-present',
    narrative: [
      'After Fukushima, Germany committed to shutting down all nuclear plants while scaling up renewables.',
      'Ambitious goals met complex reality. Electricity prices soared to among Europe\'s highest.',
      'As nuclear plants closed, dependence on Russian gas deepened. A vulnerability waiting to be exposed.',
    ],
    highlight: 'DEU',
    showCountries: ['DEU', 'FRA'],
    dataYear: 2023,
    color: 'var(--green)',
  },
  {
    id: 'crisis-2022',
    era: 'Chapter 7',
    title: 'The 2022 Energy Crisis',
    years: '2022',
    narrative: [
      'Russia invaded Ukraine. Europe\'s energy vulnerability was brutally exposed.',
      'Gas prices spiked 10x. Industrial competitiveness crumbled. Factories closed.',
      'Decades of policy choices had consequences. Emergency coal plants were restarted.',
    ],
    showCountries: ['DEU', 'POL', 'FRA', 'GBR'],
    dataYear: 2022,
    color: 'var(--clay)',
  },
  {
    id: 'present',
    era: 'Chapter 8',
    title: 'The Current Moment',
    years: '2024-2025',
    narrative: [
      'We stand at a crossroads. The energy trilemma: affordability, reliability, sustainability.',
      'Different countries are making different bets. Some double down on renewables, others on nuclear.',
      'The data tells the story. Now it\'s your turn to explore it.',
    ],
    dataYear: 2024,
    color: 'var(--scale-6)',
  },
  {
    id: 'chokepoint',
    era: 'Chapter 9',
    title: 'One Channel, Twenty Miles Wide',
    years: '2026',
    narrative: [
      'Roughly a fifth of the world\'s oil, and a large share of its liquefied gas, leaves through a single channel about twenty miles across at its narrowest. The Strait of Hormuz has always been the most concentrated risk in the energy system, and for decades it held.',
      'When that route is interrupted the price of everything moves - not because the oil has stopped existing, but because it cannot get to where it is burned. Shipping insurance, gas contracts and industrial output reprice within days of each other.',
      'The part nobody had costed: Qatar produces much of the world\'s helium as a by-product of the same gas, and it leaves by the same water. Helium cannot be manufactured, only extracted. Semiconductor fabs need it to make chips, and every MRI scanner in every hospital needs it to stay cold.',
      'Electricity is the one link in that chain a country can choose to build at home. That is the argument this whole site is making.',
    ],
    showCountries: ['QAT', 'ARE', 'SAU', 'JPN'],
    dataYear: 2025,
    color: 'var(--clay)',
  },
];

function MiniEnergyBar({ country, year }: { country: Country; year: number }) {
  const yearData = country.years[year.toString()];
  if (!yearData) return null;

  const sources = [
    { key: 'coal', pct: yearData.generation.coal?.pct || 0 },
    { key: 'gas', pct: yearData.generation.gas?.pct || 0 },
    { key: 'other_fossil', pct: yearData.generation.other_fossil?.pct || 0 },
    { key: 'nuclear', pct: yearData.generation.nuclear?.pct || 0 },
    { key: 'hydro', pct: yearData.generation.hydro?.pct || 0 },
    { key: 'wind', pct: yearData.generation.wind?.pct || 0 },
    { key: 'solar', pct: yearData.generation.solar?.pct || 0 },
    { key: 'bioenergy', pct: yearData.generation.bioenergy?.pct || 0 },
    { key: 'other_renewables', pct: yearData.generation.other_renewables?.pct || 0 },
  ].filter(s => s.pct > 0);

  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2">
        <FlagImg iso3={country.iso3} size={16} />
        <span className="text-xs font-medium text-primary">{country.name}</span>
        <span className="text-[10px] text-muted ml-auto">
          {formatPercent(yearData.aggregates.clean_pct)} clean
        </span>
      </div>
      <div className="h-3 rounded overflow-hidden flex">
        {sources.map(s => (
          <div
            key={s.key}
            style={{
              width: `${s.pct}%`,
              backgroundColor: energyColors[s.key as keyof typeof energyColors],
            }}
          />
        ))}
      </div>
    </div>
  );
}

/**
 * A chapter's accent at low opacity, for the panel behind its illustration.
 *
 * These were built by appending hex alpha - `${color}15` - which worked while
 * the accents were literal hexes and silently produced `var(--scale-5)15` once
 * they became tokens. Invalid, so every chapter lost its tint and the page went
 * flat. color-mix takes a token and gives back a real colour.
 */
function tint(color: string, percent: number): string {
  return `color-mix(in oklab, ${color} ${percent}%, transparent)`;
}

function ChapterViz({ chapter, countries }: { chapter: Chapter; countries: CountriesData | null }) {
  if (!chapter.showCountries || !countries || !chapter.dataYear) {
    return (
      <div
        className="w-full h-full rounded-2xl flex items-center justify-center"
        style={{ backgroundColor: tint(chapter.color, 14) }}
      >
        <div
          className="text-6xl font-bold opacity-20"
          style={{ color: chapter.color }}
        >
          {chapter.years}
        </div>
      </div>
    );
  }

  const countriesToShow = chapter.showCountries
    .map(iso3 => countries[iso3])
    .filter(Boolean) as Country[];

  return (
    <div
      className="w-full h-full rounded-2xl p-6 flex flex-col justify-center"
      style={{ backgroundColor: tint(chapter.color, 9) }}
    >
      <div className="text-xs text-muted uppercase tracking-wider mb-4">
        Energy Mix ({chapter.dataYear})
      </div>
      <div className="space-y-4">
        {countriesToShow.map(c => (
          <MiniEnergyBar key={c.iso3} country={c} year={chapter.dataYear!} />
        ))}
      </div>
    </div>
  );
}

export default function StoryPage() {
  const [countries, setCountries] = useState<CountriesData | null>(null);
  const [activeChapter, setActiveChapter] = useState(0);
  const chapterRefs = useRef<(HTMLElement | null)[]>([]);

  useEffect(() => {
    loadCountries()
      .then(setCountries)
      .catch(console.error);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const index = chapterRefs.current.indexOf(entry.target as HTMLElement);
            if (index !== -1) setActiveChapter(index);
          }
        });
      },
      { threshold: 0.5 }
    );

    chapterRefs.current.forEach(ref => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="gg-page min-h-screen flex flex-col">
      <TopNav active="story" />

      {/* Progress indicator */}
      <div className="fixed left-4 top-1/2 -translate-y-1/2 z-40 hidden lg:flex flex-col gap-1">
        {chapters.map((ch, i) => (
          <button
            key={ch.id}
            onClick={() => chapterRefs.current[i]?.scrollIntoView({ behavior: 'smooth' })}
            className={`w-8 h-8 rounded-full transition-all flex items-center justify-center cursor-pointer ${
              i === activeChapter ? '' : 'opacity-60 hover:opacity-100'
            }`}
            title={ch.title}
          >
            <span
              className={`rounded-full transition-all ${
                i === activeChapter ? 'w-4 h-4' : 'w-3 h-3 hover:w-3.5 hover:h-3.5'
              }`}
              style={{ backgroundColor: ch.color }}
            />
          </button>
        ))}
      </div>

      <main className="flex-1 pt-16">
        {chapters.map((chapter, i) => (
          <section
            key={chapter.id}
            ref={el => { chapterRefs.current[i] = el; }}
            className="min-h-screen flex items-center"
          >
            <div className="max-w-6xl mx-auto px-4 py-16 grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
              {/* Text side */}
              <div className={`space-y-6 ${i % 2 === 1 ? 'lg:order-2' : ''}`}>
                <div>
                  <div
                    className="text-xs font-medium uppercase tracking-wider mb-1"
                    style={{ color: chapter.color }}
                  >
                    {chapter.era} &middot; {chapter.years}
                  </div>
                  <h2 className="text-2xl lg:text-3xl font-semibold text-primary">
                    {chapter.title}
                  </h2>
                </div>
                <div className="space-y-4">
                  {chapter.narrative.map((para, j) => (
                    <p key={j} className="text-secondary leading-relaxed">
                      {para}
                    </p>
                  ))}
                </div>
                {i === chapters.length - 1 && (
                  <div className="pt-4">
                    <Link
                      href="/explore"
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium text-canvas transition-colors"
                      style={{ backgroundColor: chapter.color }}
                    >
                      Explore the Data
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M5 12h14M12 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </div>
                )}
              </div>

              {/* Visualization side */}
              <div className={`aspect-[4/3] lg:aspect-square ${i % 2 === 1 ? 'lg:order-1' : ''}`}>
                <ChapterViz chapter={chapter} countries={countries} />
              </div>
            </div>
          </section>
        ))}
      </main>

      <SiteFooter />
    </div>
  );
}
