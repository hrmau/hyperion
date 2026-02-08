'use client';

import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

function QuoteBlock({ children, attribution }: { children: React.ReactNode; attribution?: string }) {
  return (
    <blockquote className="border-l-[3px] border-[var(--color-primary-brand)] pl-5 py-1 my-6 italic text-secondary leading-relaxed">
      <p>{children}</p>
      {attribution && <cite className="text-[var(--text-sm)] text-muted mt-2 block not-italic">— {attribution}</cite>}
    </blockquote>
  );
}

function Callout({ type = 'info', icon, title, children }: { type?: 'info' | 'warning' | 'success' | 'danger'; icon?: string; title?: string; children: React.ReactNode }) {
  const icons = { info: '💡', warning: '⚠️', success: '✓', danger: '⚠️' };
  return (
    <div className={`callout callout-${type}`}>
      {title && (
        <div className="callout__header">
          <span className="callout__icon">{icon || icons[type]}</span>
          <span>{title}</span>
        </div>
      )}
      <p>{children}</p>
    </div>
  );
}

function StatCard({ icon, value, label }: { icon: string; value: string; label: string }) {
  return (
    <div className="stat-card">
      <div className="stat-card__icon">{icon}</div>
      <div className="stat-card__value">{value}</div>
      <div className="stat-card__label">{label}</div>
    </div>
  );
}

export default function WhyEnergyMattersPage() {
  return (
    <div className="min-h-screen bg-canvas flex flex-col">
      <Header currentPage="why" />

      <main className="flex-1 py-8">
        <div className="prose">
          {/* Hero Section */}
          <div className="mb-6">
            <h1 className="text-[15px] md:text-[17px] font-bold">Why Energy Matters</h1>
            <p className="text-[var(--text-article-lg)] text-secondary leading-relaxed">
              How electricity abundance shapes prosperity, security, and the future we&apos;re building for our children
            </p>
            <QuoteBlock>
              Every time you flip a light switch, charge your phone, or ride in an elevator, you&apos;re tapping into the foundation of modern civilization. But most of us never think about where that power comes from - until it&apos;s not there.
            </QuoteBlock>
            <div className="flex items-center gap-4 text-[var(--text-sm)] text-muted">
              <span>30-40 min read</span>
              <span>•</span>
              <span>Last updated: February 2026</span>
            </div>
          </div>

          {/* Quick Navigation */}
          <nav className="card px-4 py-3 mb-6">
            <h4 className="text-xs font-medium text-primary mt-0 mb-1.5 uppercase tracking-wider">Quick Navigation</h4>
            <div className="flex flex-wrap gap-1.5">
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
                  className="px-2.5 py-1 text-xs font-medium bg-inset text-secondary hover:text-primary hover:bg-canvas border border-border rounded-full transition-colors"
                >
                  {label}
                </a>
              ))}
            </div>
          </nav>

          <div className="space-y-12">
          {/* Section 1: Energy IS the Economy */}
          <section id="economy">
            <h2>1. Energy IS the Economy</h2>

            <h3>The Fundamental Truth</h3>
            <p>
              Energy isn&apos;t just part of the economy - it is the economy. Everything we produce, every service we consume, every comfort we enjoy requires energy.
            </p>

            <h3>The Connection</h3>
            <p>
              The relationship between energy consumption and prosperity isn&apos;t theoretical - it&apos;s observable in data from every country on Earth:
            </p>

            <div className="grid-3 my-6">
              <StatCard icon="🇳🇴" value="23,000" label="Norway kWh/capita" />
              <StatCard icon="🇺🇸" value="12,000" label="USA kWh/capita" />
              <StatCard icon="🇩🇪" value="6,500" label="Germany kWh/capita" />
            </div>

            <div className="grid-3 my-6">
              <StatCard icon="🇨🇳" value="6,000" label="China kWh/capita" />
              <StatCard icon="🇳🇬" value="160" label="Nigeria kWh/capita" />
              <StatCard icon="🇧🇩" value="500" label="Bangladesh kWh/capita" />
            </div>

            <Callout type="info" title="Key Insight">
              Countries with 10x more electricity consumption have ~8x higher GDP. This isn&apos;t correlation - it&apos;s causation. You can&apos;t run factories, hospitals, or data centers without electricity.
            </Callout>

            <h3>What Energy Powers</h3>
            <p>
              Most people think of energy as &quot;keeping the lights on.&quot; But energy powers everything:
            </p>

            <ul>
              <li><strong>Manufacturing & Industry</strong> — Steel (5,000 kWh/tonne), aluminum (15,000 kWh/tonne), jobs, exports</li>
              <li><strong>Food System</strong> — Fertilizer, irrigation, processing, cold chain → 8 billion people fed</li>
              <li><strong>Healthcare</strong> — 24/7 hospitals, vaccines, medical imaging → doubled life expectancy</li>
              <li><strong>Clean Water</strong> — Treatment, pumping, desalination → eliminated waterborne disease</li>
              <li><strong>Technology</strong> — Data centers, telecom, cloud services → the digital economy</li>
              <li><strong>Transportation</strong> — EVs, electric rail, urban transit → increasingly electrifying</li>
            </ul>

            <h3>The Harsh Reality</h3>
            <p>
              Countries with unreliable electricity cannot compete economically:
            </p>

            <Callout type="danger" icon="🔌" title="Energy Crisis Examples">
              <strong>South Africa (2023):</strong> 300+ days load-shedding, 0.7% GDP growth, 33% unemployment<br />
              <strong>Pakistan (2023):</strong> Textile factories closed, lost orders to Vietnam, billions in exports gone
            </Callout>

            <Callout type="warning" title="The Lesson">
              Energy isn&apos;t just infrastructure — it&apos;s economic survival.
            </Callout>
          </section>

          {/* Section 2: The Price of Energy */}
          <section id="price">
            <h2>2. The Price of Energy IS the Price of Everything</h2>

            <h3>Understanding the Ripple Effect</h3>
            <p>
              When energy prices rise, everything costs more. This isn&apos;t abstract economics - it&apos;s your grocery bill, your rent, your job security.
            </p>

            <h3>The 2022 European Energy Crisis</h3>
            <p>
              Russia reduced natural gas exports to Europe. Gas prices went from €20/MWh to €200/MWh - a 10x increase. The cascading impact:
            </p>

            <ul>
              <li><strong>Household bills</strong> — German households: €100/month → €300-500/month, energy poverty, heat vs food</li>
              <li><strong>Industrial shutdown</strong> — Fertilizer plants closed, chemical production curtailed, aluminum smelters gone permanently</li>
              <li><strong>Food prices</strong> — High gas → expensive fertilizer → food prices up 15-20%, UK food bank usage +30%</li>
              <li><strong>Competitiveness</strong> — EU factories at €200/MWh vs US €100/MWh vs China €70/MWh → production fled abroad</li>
            </ul>

            <h3>Why This Matters to Regular People</h3>
            <p>
              The abstract version: &quot;Energy policy affects macroeconomic competitiveness.&quot;
            </p>
            <p>
              The reality: Your electricity bill tripled. Your grocery costs rose 20%. Your company closed the local factory. Your neighbor lost their job.
            </p>

            <Callout type="warning" title="Permanent Economic Scarring">
              High energy costs cause lasting damage: factories close and don&apos;t come back, investment goes elsewhere, engineers move to countries with better jobs, and competitive disadvantage becomes structural.
            </Callout>

            <p>
              Your children will inherit an economy shaped by today&apos;s energy decisions. If heavy industry leaves, those jobs don&apos;t come back for a generation.
            </p>
          </section>

          {/* Section 3: Energy Security IS National Security */}
          <section id="security">
            <h2>3. Energy Security IS National Security</h2>

            <h3>The Geopolitical Reality</h3>
            <p>
              Energy dependence gives other countries leverage over you. This isn&apos;t paranoid - it&apos;s just how power works.
            </p>

            <h3>Historical Examples</h3>

            <h4>The 1970s Oil Embargos</h4>
            <ul>
              <li>1973: OPEC imposed oil embargo against Western nations</li>
              <li>Oil prices quadrupled ($3 → $12/barrel)</li>
              <li>Gas lines stretched for miles in the USA, rationing in Europe</li>
              <li>Economic recession, &quot;stagflation&quot; began</li>
            </ul>

            <Callout type="info" title="The Lesson">
              Whoever controls your energy can control your economy.
            </Callout>

            <h4>Russia-Europe Gas (2000-2022)</h4>
            <ul>
              <li>Germany: 55% of gas from Russia by 2021</li>
              <li>Justified as &quot;economic interdependence promotes peace&quot;</li>
              <li>Reality: gas cut to Ukraine in 2006, 2009; threats after Crimea 2014</li>
              <li>2022: gas weaponized completely after Ukraine invasion</li>
            </ul>

            <Callout type="warning" title="Hard Truth">
              &quot;Interdependence&quot; with an adversary is just dependency.
            </Callout>

            <h3>Modern Examples</h3>
            <ul>
              <li><strong>China rare earths</strong> — Controls 70% of production. 2010: restricted exports during Japan dispute → Japan backed down</li>
              <li><strong>Japan WWII</strong> — No domestic oil. US embargo 1941 → Pearl Harbor partly to secure Southeast Asian oil</li>
            </ul>

            <h3>The Uncomfortable Truth</h3>
            <table className="comparison-table">
              <thead>
                <tr>
                  <th>Energy Independence</th>
                  <th>Energy Dependence</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>No foreign country can cut your supply</td>
                  <td>Suppliers can threaten cutoffs</td>
                </tr>
                <tr>
                  <td>Political decisions remain yours</td>
                  <td>Economy hostage to others&apos; decisions</td>
                </tr>
                <tr>
                  <td>Economic resilience during crises</td>
                  <td>Foreign policy constrained</td>
                </tr>
                <tr>
                  <td>Strategic autonomy in foreign policy</td>
                  <td>National security compromised</td>
                </tr>
              </tbody>
            </table>
          </section>

          {/* Section 4: Policy Decisions That Shape Our Future */}
          <section id="policy">
            <h2>4. The Policy Decisions That Shape Our Future</h2>

            <h3>Why Energy Policy Matters More Than You Think</h3>
            <p>
              Energy decisions made today will shape:
            </p>
            <ul>
              <li>Your children&apos;s job prospects</li>
              <li>Your country&apos;s economic competitiveness</li>
              <li>Your national security posture</li>
              <li>Your household budget for decades</li>
            </ul>
            <p>
              These aren&apos;t &quot;future problems&quot; - they&apos;re happening now.
            </p>

            <h3>Case Study: Germany&apos;s Energiewende (2011-2024)</h3>
            <p>
              After Fukushima, Germany phased out nuclear (13.3% in 2021 → 0% by April 2023).
            </p>

            <table className="comparison-table">
              <thead>
                <tr>
                  <th>Metric</th>
                  <th>Before (2011)</th>
                  <th>After (2023)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Nuclear</td>
                  <td>13.3%</td>
                  <td className="decrease">0%</td>
                </tr>
                <tr>
                  <td>Renewables</td>
                  <td>20%</td>
                  <td className="increase">50%</td>
                </tr>
                <tr>
                  <td>Gas Dependency</td>
                  <td>35%</td>
                  <td className="increase">55%</td>
                </tr>
                <tr>
                  <td>Electricity Price vs USA</td>
                  <td>2x</td>
                  <td className="increase">3x</td>
                </tr>
              </tbody>
            </table>

            <Callout type="warning" title="The Lesson">
              Good intentions don&apos;t equal good outcomes. Nuclear was shut down before alternatives were ready.
            </Callout>

            <h3>Case Study: France&apos;s Nuclear Bet (1970s-Present)</h3>
            <p>
              After the 1973 oil crisis, France built 50+ reactors in 25 years.
            </p>

            <table className="comparison-table">
              <thead>
                <tr>
                  <th>Metric</th>
                  <th>France</th>
                  <th>Germany (comparison)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Nuclear electricity</td>
                  <td>70%</td>
                  <td>0%</td>
                </tr>
                <tr>
                  <td>Electricity prices</td>
                  <td>Lowest in Europe</td>
                  <td>Highest in Europe</td>
                </tr>
                <tr>
                  <td>CO₂ per kWh</td>
                  <td>50g</td>
                  <td>350g</td>
                </tr>
                <tr>
                  <td>Fuel imports</td>
                  <td>100% uranium</td>
                  <td>55% gas (Russia)</td>
                </tr>
              </tbody>
            </table>

            <Callout type="info" title="The Lesson">
              Strategic energy decisions have 50-year consequences.
            </Callout>

            <h3>The Common Pattern</h3>
            <p>
              Energy infrastructure lasts decades (nuclear 60+ years, pipelines 40+, renewables 20-30). Once you make a choice, you live with it. There are no perfect answers - only trade-offs.
            </p>
          </section>

          {/* Section 5: Current Decisions */}
          <section id="current">
            <h2>5. The Decisions Being Made Right Now</h2>

            <h3>Why This Moment Matters</h3>
            <p>
              The 2020s are critical: climate commitments accelerating, geopolitical tensions reshaping trade, technology costs falling. Decisions made now will define 2050-2070. Are your elected officials making them wisely?
            </p>

            <h3>Current Global Trends</h3>

            <h4>Renewable Energy Transition</h4>
            <ul>
              <li>Solar/wind costs fallen 90% in a decade</li>
              <li>Many countries committing to &quot;net zero&quot; by 2050</li>
              <li>Challenges: intermittency, grid stability, China-concentrated manufacturing, material requirements</li>
            </ul>

            <h4>The Nuclear Question</h4>
            <ul>
              <li>Some reconsidering (France, UK, Poland)</li>
              <li>Others phasing out (Germany, Belgium)</li>
              <li>New SMR technologies in development</li>
              <li>Debates: safety, waste, cost, time to build</li>
            </ul>

            <h4>Electrification of Everything</h4>
            <ul>
              <li>EVs replacing combustion cars, heat pumps replacing gas boilers</li>
              <li>Electricity demand could double by 2050</li>
              <li>Must build capacity, transition fuels, maintain reliability, keep costs reasonable - simultaneously</li>
            </ul>

            <h3>Policy Choices Being Made Now</h3>
            <table className="comparison-table">
              <thead>
                <tr>
                  <th>Energy Mix Questions</th>
                  <th>Dependency Questions</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Close coal plants? When?</td>
                  <td>Accept gas imports? From whom?</td>
                </tr>
                <tr>
                  <td>Keep nuclear or phase out?</td>
                  <td>Import solar panels from China?</td>
                </tr>
                <tr>
                  <td>How much renewable? How fast?</td>
                  <td>Buy uranium from Kazakhstan?</td>
                </tr>
                <tr>
                  <td>What provides backup?</td>
                  <td>Rely on undersea cables?</td>
                </tr>
              </tbody>
            </table>

            <Callout type="info" title="Long-term Impact">
              These decisions will shape electricity bills, industrial base, job opportunities, and national security — for decades.
            </Callout>
          </section>

          {/* Section 6: What You Can Do */}
          <section id="action">
            <h2>6. What You Can Do</h2>

            <h3>Follow the Numbers</h3>
            <p>
              When politicians talk about energy, ask:
            </p>
            <ul>
              <li>What&apos;s the total cost (not just generation)?</li>
              <li>Where does reliability come from?</li>
              <li>What are the dependencies?</li>
              <li>What&apos;s the timeline? Who bears the costs?</li>
            </ul>

            <Callout type="danger" icon="🚩" title="Red Flags">
              Promises with no cost estimates • &quot;Just build more renewables&quot; with no backup plan • Closing reliable plants with no replacement ready • Claims of &quot;independence&quot; while increasing imports
            </Callout>

            <h3>Understand Trade-offs</h3>
            <p>
              No perfect solutions. Every choice has trade-offs:
            </p>

            <table className="comparison-table">
              <thead>
                <tr>
                  <th>Source</th>
                  <th>Pros</th>
                  <th>Cons</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Coal</strong></td>
                  <td>Cheap, reliable, abundant</td>
                  <td>CO₂, air pollution</td>
                </tr>
                <tr>
                  <td><strong>Gas</strong></td>
                  <td>Cleaner than coal, flexible</td>
                  <td>CO₂, import dependency</td>
                </tr>
                <tr>
                  <td><strong>Nuclear</strong></td>
                  <td>Low carbon, reliable, dense</td>
                  <td>Waste, cost, public fear</td>
                </tr>
                <tr>
                  <td><strong>Solar/Wind</strong></td>
                  <td>Clean, falling costs</td>
                  <td>Intermittent, land use</td>
                </tr>
                <tr>
                  <td><strong>Hydro</strong></td>
                  <td>Clean, reliable, storage</td>
                  <td>Geographic limits, ecosystems</td>
                </tr>
              </tbody>
            </table>

            <Callout type="warning" title="Be Skeptical">
              Be skeptical of anyone claiming their solution has no trade-offs.
            </Callout>

            <h3>Questions to Ask Your Representatives</h3>
            <table className="comparison-table">
              <thead>
                <tr>
                  <th>Basic Questions</th>
                  <th>Policy-Specific Questions</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>What is our energy independence score?</td>
                  <td>If we close this plant, what replaces it?</td>
                </tr>
                <tr>
                  <td>What % of electricity from imports?</td>
                  <td>If we buy panels from China, what&apos;s the risk?</td>
                </tr>
                <tr>
                  <td>What if our supplier cuts us off?</td>
                  <td>How much total cost, and who pays?</td>
                </tr>
                <tr>
                  <td>How will this affect prices?</td>
                  <td>What&apos;s the plan if this doesn&apos;t work?</td>
                </tr>
              </tbody>
            </table>

            <p>
              <strong>Don&apos;t accept vague answers. Demand specifics.</strong>
            </p>
          </section>

          {/* Section 7: The Path Forward */}
          <section id="forward">
            <h2>7. The Path Forward</h2>

            <h3>What Good Energy Policy Looks Like</h3>
            <p>
              Good energy policy balances:
            </p>
            <ul>
              <li><strong>Affordability</strong> — reasonable costs</li>
              <li><strong>Reliability</strong> — 24/7 availability</li>
              <li><strong>Security</strong> — minimize dependencies</li>
              <li><strong>Sustainability</strong> — environmental concerns</li>
              <li><strong>Realism</strong> — engineering reality</li>
            </ul>

            <Callout type="info" title="The Energy Trilemma">
              You can&apos;t maximize all at once. Trade-offs are inevitable.
            </Callout>

            <h3>What Bad Energy Policy Looks Like</h3>
            <ul>
              <li>Closing reliable plants before replacements are ready</li>
              <li>Creating new dependencies while claiming &quot;independence&quot;</li>
              <li>Ignoring costs or pushing them to future generations</li>
              <li>Ideology over engineering (from both left and right)</li>
              <li>Short-term thinking based on election cycles</li>
              <li>Assuming technology miracles will save us</li>
            </ul>

            <h3>Countries Getting It (Mostly) Right</h3>
            <div className="grid-3 my-6">
              <div className="stat-card">
                <div className="stat-card__icon">🇳🇴</div>
                <div className="stat-card__value">Norway</div>
                <div className="stat-card__label">95%+ renewable, hydro-based, independent & affordable</div>
              </div>
              <div className="stat-card">
                <div className="stat-card__icon">🇫🇷</div>
                <div className="stat-card__value">France</div>
                <div className="stat-card__label">70% nuclear, low-carbon, 50-year strategic bet</div>
              </div>
              <div className="stat-card">
                <div className="stat-card__icon">🇵🇱</div>
                <div className="stat-card__value">Poland</div>
                <div className="stat-card__label">Diversifying: nuclear + offshore wind + coal backup</div>
              </div>
            </div>

            <h3>The Hope</h3>
            <Callout type="success" icon="✓" title="Good News">
              Technology is improving, costs are falling, and awareness is rising (2022 was a wake-up call). Solutions exist.
            </Callout>
            <p>
              The challenge: Build faster than ever while maintaining reliability, managing costs, navigating geopolitics. Hard, but doable — if we&apos;re smart.
            </p>
          </section>

          {/* Section 8: Final Thoughts */}
          <section id="final">
            <h2>8. Final Thoughts</h2>

            <h3>The Core Message</h3>
            <p>
              Energy is not just another policy issue. Energy is:
            </p>
            <ul>
              <li>The foundation of prosperity</li>
              <li>The basis of national security</li>
              <li>The determinant of quality of life</li>
              <li>The shape of the future we&apos;re building</li>
            </ul>
            <p>
              When energy works, economies grow and futures look bright. When it fails, economies contract and countries become vulnerable. It really is that fundamental.
            </p>

            <h3>Why Grid Gorilla Exists</h3>
            <p>
              Energy policy deserves serious, honest, data-driven analysis. Transparency beats propaganda, data beats ideology, long-term thinking beats short-term politics, and informed citizens make better democracies.
            </p>

            <QuoteBlock>
              Energy policy matters more than you think. It affects your wallet, your job, your security, your children&apos;s future. Pay attention. Ask questions. Vote with it in mind. The decisions being made right now will echo for decades.
            </QuoteBlock>

            <h3>Three Things You Can Do Right Now</h3>
            <div className="grid-3 my-8">
              <div className="action-card">
                <div className="action-card__icon">🔍</div>
                <div className="action-card__title">1. Explore Your Country</div>
                <div className="action-card__description">
                  Understand your country&apos;s energy reality
                </div>
                <Link href="/" className="action-card__button">
                  Explore the map →
                </Link>
              </div>
              <div className="action-card">
                <div className="action-card__icon">❓</div>
                <div className="action-card__title">2. Ask Questions</div>
                <div className="action-card__description">
                  Ask about costs, backup plans, dependencies
                </div>
              </div>
              <div className="action-card">
                <div className="action-card__icon">📤</div>
                <div className="action-card__title">3. Share This</div>
                <div className="action-card__description">
                  Send to anyone who pays an electricity bill
                </div>
              </div>
            </div>

            <div className="text-center py-6">
              <p className="text-[var(--text-article-lg)] text-primary font-semibold mb-2">Energy is too important for apathy.</p>
              <p className="text-secondary">Get informed. Ask questions. Demand better.</p>
            </div>
          </section>
        </div>

        {/* Back to top */}
        <div className="mt-12 pt-6 border-t border-border text-center">
          <a
            href="#"
            className="text-[var(--text-article-base)] text-muted hover:text-primary transition-colors"
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          >
            ↑ Back to top
          </a>
        </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
