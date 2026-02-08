'use client';

import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

function QuoteBlock({ children, attribution }: { children: React.ReactNode; attribution?: string }) {
  return (
    <blockquote className="border-l-4 border-primary pl-4 py-1.5 my-4">
      <p className="text-sm text-secondary italic leading-relaxed">{children}</p>
      {attribution && <cite className="text-xs text-muted mt-1.5 block not-italic">- {attribution}</cite>}
    </blockquote>
  );
}

export default function WhyEnergyMattersPage() {
  return (
    <div className="min-h-screen bg-canvas flex flex-col">
      <Header currentPage="why" />

      <main className="flex-1 max-w-4xl mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="mb-8">
          <h1 className="text-xl font-semibold text-primary mb-2">Why Energy Matters</h1>
          <p className="text-sm text-secondary leading-relaxed mb-4">
            How electricity abundance shapes prosperity, security, and the future we&apos;re building for our children
          </p>
          <QuoteBlock>
            Every time you flip a light switch, charge your phone, or ride in an elevator, you&apos;re tapping into the foundation of modern civilization. But most of us never think about where that power comes from - until it&apos;s not there.
          </QuoteBlock>
          <div className="flex items-center gap-4 text-xs text-muted">
            <span>30-40 min read</span>
            <span>•</span>
            <span>Last updated: February 2026</span>
          </div>
        </div>

        {/* Quick Navigation */}
        <nav className="card p-3 mb-8">
          <h3 className="text-xs font-medium text-primary mb-2">Quick Navigation</h3>
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'economy', label: 'Energy IS the Economy' },
              { id: 'price', label: 'Price of Everything' },
              { id: 'security', label: 'National Security' },
              { id: 'policy', label: 'Policy Decisions' },
              { id: 'current', label: 'Current Decisions' },
              { id: 'action', label: 'What You Can Do' },
              { id: 'forward', label: 'Path Forward' },
              { id: 'final', label: 'Final Thoughts' },
            ].map(({ id, label }) => (
              <a
                key={id}
                href={`#${id}`}
                className="px-3 py-1.5 text-xs font-medium bg-inset text-secondary hover:text-primary hover:bg-canvas border border-border rounded-full transition-colors"
              >
                {label}
              </a>
            ))}
          </div>
        </nav>

        <div className="space-y-10">
          {/* Section 1: Energy IS the Economy */}
          <section id="economy">
            <h2 className="text-base font-semibold text-primary mb-4">1. Energy IS the Economy</h2>

            <h3 className="text-sm font-medium text-primary mb-2">The Fundamental Truth</h3>
            <p className="text-sm text-secondary leading-relaxed mb-4">
              Energy isn&apos;t just part of the economy - it is the economy. Everything we produce, every service we consume, every comfort we enjoy requires energy.
            </p>

            <h3 className="text-sm font-medium text-primary mb-2">The Connection</h3>
            <p className="text-sm text-secondary leading-relaxed mb-3">
              The relationship between energy consumption and prosperity isn&apos;t theoretical - it&apos;s observable in data from every country on Earth:
            </p>

            <div className="card p-4 mb-4">
              <h4 className="text-xs font-medium text-primary mb-3">GDP per Capita vs. Electricity Consumption</h4>
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <div className="text-[10px] text-muted uppercase tracking-wider mb-2">High GDP, High Electricity</div>
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between"><span className="text-secondary">Norway</span><span className="text-primary">23,000 kWh/capita</span></div>
                    <div className="flex justify-between"><span className="text-secondary">USA</span><span className="text-primary">12,000 kWh/capita</span></div>
                    <div className="flex justify-between"><span className="text-secondary">Germany</span><span className="text-primary">6,500 kWh/capita</span></div>
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-muted uppercase tracking-wider mb-2">Middle Income, Growing</div>
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between"><span className="text-secondary">China</span><span className="text-primary">6,000 kWh/capita</span></div>
                    <div className="flex justify-between"><span className="text-secondary">Poland</span><span className="text-primary">4,500 kWh/capita</span></div>
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-muted uppercase tracking-wider mb-2">Low Income, Low Electricity</div>
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between"><span className="text-secondary">Nigeria</span><span className="text-primary">160 kWh/capita</span></div>
                    <div className="flex justify-between"><span className="text-secondary">Bangladesh</span><span className="text-primary">500 kWh/capita</span></div>
                  </div>
                </div>
              </div>
            </div>

            <p className="text-sm text-secondary leading-relaxed mb-4">
              This isn&apos;t correlation without causation - it&apos;s causation. You can&apos;t run factories, hospitals, or data centers without electricity. Prosperity requires abundant, affordable, reliable energy.
            </p>

            <h3 className="text-sm font-medium text-primary mb-2">What Energy Powers</h3>
            <p className="text-sm text-secondary leading-relaxed mb-2">
              Most people think of energy as &quot;keeping the lights on.&quot; But energy powers everything:
            </p>

            <ul className="text-sm text-secondary space-y-1.5 mb-4 list-disc list-inside">
              <li><span className="text-primary font-medium">Manufacturing & Industry</span> - Steel (5,000 kWh/tonne), aluminum (15,000 kWh/tonne), jobs, exports</li>
              <li><span className="text-primary font-medium">Food System</span> - Fertilizer, irrigation, processing, cold chain → 8 billion people fed</li>
              <li><span className="text-primary font-medium">Healthcare</span> - 24/7 hospitals, vaccines, medical imaging → doubled life expectancy</li>
              <li><span className="text-primary font-medium">Clean Water</span> - Treatment, pumping, desalination → eliminated waterborne disease</li>
              <li><span className="text-primary font-medium">Technology</span> - Data centers, telecom, cloud services → the digital economy</li>
              <li><span className="text-primary font-medium">Transportation</span> - EVs, electric rail, urban transit → increasingly electrifying</li>
            </ul>

            <h3 className="text-sm font-medium text-primary mb-2">The Harsh Reality</h3>
            <p className="text-sm text-secondary leading-relaxed mb-2">
              Countries with unreliable electricity cannot compete economically:
            </p>
            <ul className="text-sm text-secondary space-y-1.5 mb-4 list-disc list-inside">
              <li><span className="text-primary font-medium">South Africa (2023)</span> - 300+ days load-shedding, 0.7% GDP growth, 33% unemployment</li>
              <li><span className="text-primary font-medium">Pakistan (2023)</span> - Textile factories closed, lost orders to Vietnam, billions in exports gone</li>
            </ul>
            <p className="text-sm text-secondary leading-relaxed">
              The lesson: Energy isn&apos;t just infrastructure - it&apos;s economic survival.
            </p>
          </section>

          {/* Section 2: The Price of Energy */}
          <section id="price">
            <h2 className="text-base font-semibold text-primary mb-4">2. The Price of Energy IS the Price of Everything</h2>

            <h3 className="text-sm font-medium text-primary mb-2">Understanding the Ripple Effect</h3>
            <p className="text-sm text-secondary leading-relaxed mb-4">
              When energy prices rise, everything costs more. This isn&apos;t abstract economics - it&apos;s your grocery bill, your rent, your job security.
            </p>

            <h3 className="text-sm font-medium text-primary mb-2">The 2022 European Energy Crisis</h3>
            <p className="text-sm text-secondary leading-relaxed mb-2">
              Russia reduced natural gas exports to Europe. Gas prices went from €20/MWh to €200/MWh - a 10x increase. The cascading impact:
            </p>

            <ul className="text-sm text-secondary space-y-1.5 mb-4 list-disc list-inside">
              <li><span className="text-primary font-medium">Household bills</span> - German households: €100/month → €300-500/month, energy poverty, heat vs food</li>
              <li><span className="text-primary font-medium">Industrial shutdown</span> - Fertilizer plants closed, chemical production curtailed, aluminum smelters gone permanently</li>
              <li><span className="text-primary font-medium">Food prices</span> - High gas → expensive fertilizer → food prices up 15-20%, UK food bank usage +30%</li>
              <li><span className="text-primary font-medium">Competitiveness</span> - EU factories at €200/MWh vs US €100/MWh vs China €70/MWh → production fled abroad</li>
            </ul>

            <h3 className="text-sm font-medium text-primary mb-2">Why This Matters to Regular People</h3>
            <p className="text-sm text-secondary leading-relaxed mb-2">
              The abstract version: &quot;Energy policy affects macroeconomic competitiveness.&quot;
            </p>
            <p className="text-sm text-secondary leading-relaxed mb-3">
              The reality: Your electricity bill tripled. Your grocery costs rose 20%. Your company closed the local factory. Your neighbor lost their job.
            </p>

            <p className="text-sm text-secondary leading-relaxed mb-2">
              High energy costs cause permanent economic scarring:
            </p>
            <ul className="text-sm text-secondary space-y-1 mb-3 list-disc list-inside">
              <li>Factories close and don&apos;t come back</li>
              <li>Investment goes elsewhere</li>
              <li>Engineers move to countries with better jobs</li>
              <li>Competitive disadvantage becomes structural</li>
            </ul>

            <p className="text-sm text-secondary leading-relaxed">
              Your children will inherit an economy shaped by today&apos;s energy decisions. If heavy industry leaves, those jobs don&apos;t come back for a generation.
            </p>
          </section>

          {/* Section 3: Energy Security IS National Security */}
          <section id="security">
            <h2 className="text-base font-semibold text-primary mb-4">3. Energy Security IS National Security</h2>

            <h3 className="text-sm font-medium text-primary mb-2">The Geopolitical Reality</h3>
            <p className="text-sm text-secondary leading-relaxed mb-4">
              Energy dependence gives other countries leverage over you. This isn&apos;t paranoid - it&apos;s just how power works.
            </p>

            <h3 className="text-sm font-medium text-primary mb-2">Historical Examples</h3>

            <p className="text-sm text-secondary leading-relaxed mb-2">
              <span className="text-primary font-medium">The 1970s Oil Embargos:</span>
            </p>
            <ul className="text-sm text-secondary space-y-1 mb-3 list-disc list-inside">
              <li>1973: OPEC imposed oil embargo against Western nations</li>
              <li>Oil prices quadrupled ($3 → $12/barrel)</li>
              <li>Gas lines stretched for miles in the USA, rationing in Europe</li>
              <li>Economic recession, &quot;stagflation&quot; began</li>
              <li>Lesson: Whoever controls your energy can control your economy</li>
            </ul>

            <p className="text-sm text-secondary leading-relaxed mb-2">
              <span className="text-primary font-medium">Russia-Europe Gas (2000-2022):</span>
            </p>
            <ul className="text-sm text-secondary space-y-1 mb-3 list-disc list-inside">
              <li>Germany: 55% of gas from Russia by 2021</li>
              <li>Justified as &quot;economic interdependence promotes peace&quot;</li>
              <li>Reality: gas cut to Ukraine in 2006, 2009; threats after Crimea 2014</li>
              <li>2022: gas weaponized completely after Ukraine invasion</li>
              <li>&quot;Interdependence&quot; with an adversary is just dependency</li>
            </ul>

            <h3 className="text-sm font-medium text-primary mb-2">Modern Examples</h3>
            <ul className="text-sm text-secondary space-y-1.5 mb-4 list-disc list-inside">
              <li><span className="text-primary font-medium">China rare earths</span> - Controls 70% of production. 2010: restricted exports during Japan dispute → Japan backed down</li>
              <li><span className="text-primary font-medium">Japan WWII</span> - No domestic oil. US embargo 1941 → Pearl Harbor partly to secure Southeast Asian oil</li>
            </ul>

            <h3 className="text-sm font-medium text-primary mb-2">The Uncomfortable Truth</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-secondary mb-1.5 font-medium">Energy independence guarantees:</p>
                <ul className="text-xs text-secondary space-y-1 list-disc list-inside">
                  <li>No foreign country can cut your supply</li>
                  <li>Political decisions remain yours</li>
                  <li>Economic resilience during crises</li>
                  <li>Strategic autonomy in foreign policy</li>
                </ul>
              </div>
              <div>
                <p className="text-sm text-secondary mb-1.5 font-medium">Energy dependence means:</p>
                <ul className="text-xs text-secondary space-y-1 list-disc list-inside">
                  <li>Suppliers can threaten cutoffs</li>
                  <li>Economy hostage to others&apos; decisions</li>
                  <li>Foreign policy constrained</li>
                  <li>National security compromised</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Section 4: Policy Decisions That Shape Our Future */}
          <section id="policy">
            <h2 className="text-base font-semibold text-primary mb-4">4. The Policy Decisions That Shape Our Future</h2>

            <h3 className="text-sm font-medium text-primary mb-2">Why Energy Policy Matters More Than You Think</h3>
            <p className="text-sm text-secondary leading-relaxed mb-2">
              Energy decisions made today will shape:
            </p>
            <ul className="text-sm text-secondary space-y-1 mb-3 list-disc list-inside">
              <li>Your children&apos;s job prospects</li>
              <li>Your country&apos;s economic competitiveness</li>
              <li>Your national security posture</li>
              <li>Your household budget for decades</li>
            </ul>
            <p className="text-sm text-secondary leading-relaxed mb-4">
              These aren&apos;t &quot;future problems&quot; - they&apos;re happening now.
            </p>

            <h3 className="text-sm font-medium text-primary mb-2">Case Study: Germany&apos;s Energiewende (2011-2024)</h3>
            <p className="text-sm text-secondary leading-relaxed mb-2">
              After Fukushima, Germany phased out nuclear (13.3% in 2021 → 0% by April 2023).
            </p>
            <div className="grid md:grid-cols-2 gap-3 mb-3">
              <div>
                <p className="text-xs text-positive font-medium mb-1">Successes:</p>
                <ul className="text-xs text-secondary space-y-0.5 list-disc list-inside">
                  <li>Renewables grew 20% → 50%</li>
                  <li>Massive wind/solar build-out</li>
                  <li>Proved renewables can scale</li>
                </ul>
              </div>
              <div>
                <p className="text-xs text-negative font-medium mb-1">Failures:</p>
                <ul className="text-xs text-secondary space-y-0.5 list-disc list-inside">
                  <li>Gas dependency increased</li>
                  <li>Prices 3x USA prices</li>
                  <li>Coal use actually increased</li>
                  <li>2022 crisis exposed vulnerability</li>
                </ul>
              </div>
            </div>
            <p className="text-sm text-secondary leading-relaxed mb-4">
              Lesson: Good intentions don&apos;t equal good outcomes. Nuclear was shut down before alternatives were ready.
            </p>

            <h3 className="text-sm font-medium text-primary mb-2">Case Study: France&apos;s Nuclear Bet (1970s-Present)</h3>
            <p className="text-sm text-secondary leading-relaxed mb-2">
              After the 1973 oil crisis, France built 50+ reactors in 25 years.
            </p>
            <div className="grid md:grid-cols-2 gap-3 mb-3">
              <div>
                <p className="text-xs text-positive font-medium mb-1">Successes:</p>
                <ul className="text-xs text-secondary space-y-0.5 list-disc list-inside">
                  <li>70% nuclear electricity</li>
                  <li>Lowest prices in Europe</li>
                  <li>50g CO₂/kWh vs Germany&apos;s 350g</li>
                </ul>
              </div>
              <div>
                <p className="text-xs text-muted font-medium mb-1">Challenges:</p>
                <ul className="text-xs text-secondary space-y-0.5 list-disc list-inside">
                  <li>100% uranium imports</li>
                  <li>Aging fleet maintenance</li>
                  <li>New builds expensive/delayed</li>
                </ul>
              </div>
            </div>
            <p className="text-sm text-secondary leading-relaxed mb-4">
              Lesson: Strategic energy decisions have 50-year consequences.
            </p>

            <h3 className="text-sm font-medium text-primary mb-2">The Common Pattern</h3>
            <p className="text-sm text-secondary leading-relaxed">
              Energy infrastructure lasts decades (nuclear 60+ years, pipelines 40+, renewables 20-30). Once you make a choice, you live with it. There are no perfect answers - only trade-offs.
            </p>
          </section>

          {/* Section 5: Current Decisions */}
          <section id="current">
            <h2 className="text-base font-semibold text-primary mb-4">5. The Decisions Being Made Right Now</h2>

            <h3 className="text-sm font-medium text-primary mb-2">Why This Moment Matters</h3>
            <p className="text-sm text-secondary leading-relaxed mb-3">
              The 2020s are critical: climate commitments accelerating, geopolitical tensions reshaping trade, technology costs falling. Decisions made now will define 2050-2070. Are your elected officials making them wisely?
            </p>

            <h3 className="text-sm font-medium text-primary mb-2">Current Global Trends</h3>

            <p className="text-sm text-secondary leading-relaxed mb-2">
              <span className="text-primary font-medium">Renewable Energy Transition:</span>
            </p>
            <ul className="text-sm text-secondary space-y-1 mb-3 list-disc list-inside">
              <li>Solar/wind costs fallen 90% in a decade</li>
              <li>Many countries committing to &quot;net zero&quot; by 2050</li>
              <li>Challenges: intermittency, grid stability, China-concentrated manufacturing, material requirements</li>
            </ul>

            <p className="text-sm text-secondary leading-relaxed mb-2">
              <span className="text-primary font-medium">The Nuclear Question:</span>
            </p>
            <ul className="text-sm text-secondary space-y-1 mb-3 list-disc list-inside">
              <li>Some reconsidering (France, UK, Poland)</li>
              <li>Others phasing out (Germany, Belgium)</li>
              <li>New SMR technologies in development</li>
              <li>Debates: safety, waste, cost, time to build</li>
            </ul>

            <p className="text-sm text-secondary leading-relaxed mb-2">
              <span className="text-primary font-medium">Electrification of Everything:</span>
            </p>
            <ul className="text-sm text-secondary space-y-1 mb-4 list-disc list-inside">
              <li>EVs replacing combustion cars, heat pumps replacing gas boilers</li>
              <li>Electricity demand could double by 2050</li>
              <li>Must build capacity, transition fuels, maintain reliability, keep costs reasonable - simultaneously</li>
            </ul>

            <h3 className="text-sm font-medium text-primary mb-2">Policy Choices Being Made Now</h3>
            <div className="grid md:grid-cols-2 gap-4 mb-3">
              <div>
                <p className="text-sm text-secondary mb-1.5 font-medium">Energy Mix:</p>
                <ul className="text-xs text-secondary space-y-1 list-disc list-inside">
                  <li>Close coal plants? When?</li>
                  <li>Keep nuclear or phase out?</li>
                  <li>How much renewable? How fast?</li>
                  <li>What provides backup?</li>
                </ul>
              </div>
              <div>
                <p className="text-sm text-secondary mb-1.5 font-medium">Dependencies:</p>
                <ul className="text-xs text-secondary space-y-1 list-disc list-inside">
                  <li>Accept gas imports? From whom?</li>
                  <li>Import solar panels from China?</li>
                  <li>Buy uranium from Kazakhstan?</li>
                  <li>Rely on undersea cables?</li>
                </ul>
              </div>
            </div>
            <p className="text-sm text-secondary leading-relaxed">
              These decisions will shape electricity bills, industrial base, job opportunities, and national security - for decades.
            </p>
          </section>

          {/* Section 6: What You Can Do */}
          <section id="action">
            <h2 className="text-base font-semibold text-primary mb-4">6. What You Can Do</h2>

            <h3 className="text-sm font-medium text-primary mb-2">Follow the Numbers</h3>
            <p className="text-sm text-secondary leading-relaxed mb-2">
              When politicians talk about energy, ask:
            </p>
            <ul className="text-sm text-secondary space-y-1 mb-3 list-disc list-inside">
              <li>What&apos;s the total cost (not just generation)?</li>
              <li>Where does reliability come from?</li>
              <li>What are the dependencies?</li>
              <li>What&apos;s the timeline? Who bears the costs?</li>
            </ul>
            <p className="text-sm text-secondary leading-relaxed mb-2">
              <span className="text-negative font-medium">Red flags:</span>
            </p>
            <ul className="text-sm text-secondary space-y-1 mb-4 list-disc list-inside">
              <li>Promises with no cost estimates</li>
              <li>&quot;Just build more renewables&quot; with no backup plan</li>
              <li>Closing reliable plants with no replacement ready</li>
              <li>Claims of &quot;independence&quot; while increasing imports</li>
            </ul>

            <h3 className="text-sm font-medium text-primary mb-2">Understand Trade-offs</h3>
            <p className="text-sm text-secondary leading-relaxed mb-2">
              No perfect solutions. Every choice has trade-offs:
            </p>
            <ul className="text-sm text-secondary space-y-1.5 mb-3 list-disc list-inside">
              <li><span className="text-primary font-medium">Coal</span> - Cheap, reliable, abundant / CO₂, air pollution</li>
              <li><span className="text-primary font-medium">Gas</span> - Cleaner than coal, flexible / CO₂, import dependency</li>
              <li><span className="text-primary font-medium">Nuclear</span> - Low carbon, reliable, dense / waste, cost, public fear</li>
              <li><span className="text-primary font-medium">Solar/Wind</span> - Clean, falling costs / intermittent, land use</li>
              <li><span className="text-primary font-medium">Hydro</span> - Clean, reliable, storage / geographic limits, ecosystems</li>
            </ul>
            <p className="text-sm text-secondary leading-relaxed mb-4">
              Be skeptical of anyone claiming their solution has no trade-offs.
            </p>

            <h3 className="text-sm font-medium text-primary mb-2">Questions to Ask Your Representatives</h3>
            <div className="grid md:grid-cols-2 gap-3 mb-3">
              <div>
                <p className="text-xs text-muted font-medium mb-1">Basic questions:</p>
                <ul className="text-xs text-secondary space-y-0.5 list-disc list-inside">
                  <li>What is our energy independence score?</li>
                  <li>What % of electricity from imports?</li>
                  <li>What if our supplier cuts us off?</li>
                  <li>How will this affect prices?</li>
                </ul>
              </div>
              <div>
                <p className="text-xs text-muted font-medium mb-1">Policy-specific:</p>
                <ul className="text-xs text-secondary space-y-0.5 list-disc list-inside">
                  <li>If we close this plant, what replaces it?</li>
                  <li>If we buy panels from China, what&apos;s the risk?</li>
                  <li>How much total cost, and who pays?</li>
                  <li>What&apos;s the plan if this doesn&apos;t work?</li>
                </ul>
              </div>
            </div>
            <p className="text-sm text-secondary leading-relaxed">
              Don&apos;t accept vague answers. Demand specifics.
            </p>
          </section>

          {/* Section 7: The Path Forward */}
          <section id="forward">
            <h2 className="text-base font-semibold text-primary mb-4">7. The Path Forward</h2>

            <h3 className="text-sm font-medium text-primary mb-2">What Good Energy Policy Looks Like</h3>
            <p className="text-sm text-secondary leading-relaxed mb-2">
              Good energy policy balances:
            </p>
            <ul className="text-sm text-secondary space-y-1 mb-3 list-disc list-inside">
              <li><span className="text-primary font-medium">Affordability</span> - reasonable costs</li>
              <li><span className="text-primary font-medium">Reliability</span> - 24/7 availability</li>
              <li><span className="text-primary font-medium">Security</span> - minimize dependencies</li>
              <li><span className="text-primary font-medium">Sustainability</span> - environmental concerns</li>
              <li><span className="text-primary font-medium">Realism</span> - engineering reality</li>
            </ul>
            <p className="text-sm text-secondary leading-relaxed mb-4">
              This is the Energy Trilemma: You can&apos;t maximize all at once. Trade-offs are inevitable.
            </p>

            <h3 className="text-sm font-medium text-primary mb-2">What Bad Energy Policy Looks Like</h3>
            <ul className="text-sm text-secondary space-y-1 mb-4 list-disc list-inside">
              <li>Closing reliable plants before replacements are ready</li>
              <li>Creating new dependencies while claiming &quot;independence&quot;</li>
              <li>Ignoring costs or pushing them to future generations</li>
              <li>Ideology over engineering (from both left and right)</li>
              <li>Short-term thinking based on election cycles</li>
              <li>Assuming technology miracles will save us</li>
            </ul>

            <h3 className="text-sm font-medium text-primary mb-2">Countries Getting It (Mostly) Right</h3>
            <ul className="text-sm text-secondary space-y-1.5 mb-4 list-disc list-inside">
              <li><span className="text-primary font-medium">Norway</span> - Leveraged hydro, 95%+ renewable, independent, secure, affordable</li>
              <li><span className="text-primary font-medium">France</span> - Long-term nuclear bet in 1970s, reliable/low-cost/low-carbon for 50 years</li>
              <li><span className="text-primary font-medium">Poland</span> - Diversifying from Russian gas, building nuclear, offshore wind, coal as backup</li>
            </ul>

            <h3 className="text-sm font-medium text-primary mb-2">The Hope</h3>
            <p className="text-sm text-secondary leading-relaxed mb-2">
              Good news: Technology improving, costs falling, awareness rising (2022 was wake-up call). Solutions exist.
            </p>
            <p className="text-sm text-secondary leading-relaxed">
              The challenge: Build faster than ever while maintaining reliability, managing costs, navigating geopolitics. Hard, but doable - if we&apos;re smart.
            </p>
          </section>

          {/* Section 8: Final Thoughts */}
          <section id="final">
            <h2 className="text-base font-semibold text-primary mb-4">8. Final Thoughts</h2>

            <h3 className="text-sm font-medium text-primary mb-2">The Core Message</h3>
            <p className="text-sm text-secondary leading-relaxed mb-2">
              Energy is not just another policy issue. Energy is:
            </p>
            <ul className="text-sm text-secondary space-y-1 mb-3 list-disc list-inside">
              <li>The foundation of prosperity</li>
              <li>The basis of national security</li>
              <li>The determinant of quality of life</li>
              <li>The shape of the future we&apos;re building</li>
            </ul>
            <p className="text-sm text-secondary leading-relaxed mb-4">
              When energy works, economies grow and futures look bright. When it fails, economies contract and countries become vulnerable. It really is that fundamental.
            </p>

            <h3 className="text-sm font-medium text-primary mb-2">Why Hyperion Exists</h3>
            <p className="text-sm text-secondary leading-relaxed mb-4">
              Energy policy deserves serious, honest, data-driven analysis. Transparency beats propaganda, data beats ideology, long-term thinking beats short-term politics, and informed citizens make better democracies.
            </p>

            <QuoteBlock>
              Energy policy matters more than you think. It affects your wallet, your job, your security, your children&apos;s future. Pay attention. Ask questions. Vote with it in mind. The decisions being made right now will echo for decades.
            </QuoteBlock>

            <h3 className="text-sm font-medium text-primary mb-3">Three Things You Can Do Right Now</h3>
            <div className="grid md:grid-cols-3 gap-3 mb-6">
              <div className="card p-4 text-center">
                <div className="text-2xl mb-1.5">🔍</div>
                <h4 className="text-sm font-medium text-primary mb-1">1. Explore Your Country</h4>
                <p className="text-xs text-secondary mb-2">Understand your country&apos;s energy reality</p>
                <Link href="/" className="text-xs text-blue-600 dark:text-blue-400 hover:underline">
                  Explore the map →
                </Link>
              </div>
              <div className="card p-4 text-center">
                <div className="text-2xl mb-1.5">❓</div>
                <h4 className="text-sm font-medium text-primary mb-1">2. Ask Questions</h4>
                <p className="text-xs text-secondary">Ask about costs, backup plans, dependencies</p>
              </div>
              <div className="card p-4 text-center">
                <div className="text-2xl mb-1.5">📤</div>
                <h4 className="text-sm font-medium text-primary mb-1">3. Share This</h4>
                <p className="text-xs text-secondary">Send to anyone who pays an electricity bill</p>
              </div>
            </div>

            <div className="text-center py-4">
              <p className="text-sm text-primary font-medium mb-1">Energy is too important for apathy.</p>
              <p className="text-xs text-secondary">Get informed. Ask questions. Demand better.</p>
            </div>
          </section>
        </div>

        {/* Back to top */}
        <div className="mt-12 pt-6 border-t border-border text-center">
          <a
            href="#"
            className="text-sm text-muted hover:text-primary transition-colors"
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          >
            ↑ Back to top
          </a>
        </div>
      </main>

      <Footer />
    </div>
  );
}
