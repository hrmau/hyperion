'use client';

import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

function QuoteBlock({ children, attribution }: { children: React.ReactNode; attribution?: string }) {
  return (
    <blockquote className="border-l-4 border-primary pl-6 py-2 my-6">
      <p className="text-lg text-secondary italic leading-relaxed">{children}</p>
      {attribution && <cite className="text-sm text-muted mt-2 block not-italic">- {attribution}</cite>}
    </blockquote>
  );
}

export default function WhyEnergyMattersPage() {
  return (
    <div className="min-h-screen bg-canvas flex flex-col">
      <Header currentPage="why" />

      <main className="flex-1 max-w-4xl mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="mb-12">
          <h1 className="text-3xl font-semibold text-primary mb-4">Why Energy Matters</h1>
          <p className="text-lg text-secondary leading-relaxed mb-6">
            How electricity abundance shapes prosperity, security, and the future we&apos;re building for our children
          </p>
          <QuoteBlock>
            Every time you flip a light switch, charge your phone, or ride in an elevator, you&apos;re tapping into the foundation of modern civilization. But most of us never think about where that power comes from - until it&apos;s not there.
          </QuoteBlock>
          <div className="flex items-center gap-4 text-sm text-muted">
            <span>30-40 min read</span>
            <span>•</span>
            <span>Last updated: February 2026</span>
          </div>
        </div>

        {/* Quick Navigation */}
        <nav className="card p-4 mb-10">
          <h3 className="text-sm font-medium text-primary mb-3">Quick Navigation</h3>
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

        <div className="space-y-16">
          {/* Section 1: Energy IS the Economy */}
          <section id="economy">
            <h2 className="text-xl font-semibold text-primary mb-6">1. Energy IS the Economy</h2>

            <h3 className="text-lg font-medium text-primary mb-3">The Fundamental Truth</h3>
            <p className="text-secondary leading-relaxed mb-6">
              Energy isn&apos;t just part of the economy - it is the economy. Everything we produce, every service we consume, every comfort we enjoy requires energy.
            </p>

            <h3 className="text-lg font-medium text-primary mb-3">The Connection</h3>
            <p className="text-secondary leading-relaxed mb-4">
              The relationship between energy consumption and prosperity isn&apos;t theoretical - it&apos;s observable in data from every country on Earth:
            </p>

            <div className="card p-6 mb-6">
              <h4 className="text-sm font-medium text-primary mb-4">GDP per Capita vs. Electricity Consumption</h4>
              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <div className="text-xs text-muted uppercase tracking-wider mb-3">High GDP, High Electricity</div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-secondary">Norway</span><span className="text-primary">23,000 kWh/capita</span></div>
                    <div className="flex justify-between"><span className="text-secondary">USA</span><span className="text-primary">12,000 kWh/capita</span></div>
                    <div className="flex justify-between"><span className="text-secondary">Germany</span><span className="text-primary">6,500 kWh/capita</span></div>
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted uppercase tracking-wider mb-3">Middle Income, Growing</div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-secondary">China</span><span className="text-primary">6,000 kWh/capita</span></div>
                    <div className="flex justify-between"><span className="text-secondary">Poland</span><span className="text-primary">4,500 kWh/capita</span></div>
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted uppercase tracking-wider mb-3">Low Income, Low Electricity</div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-secondary">Nigeria</span><span className="text-primary">160 kWh/capita</span></div>
                    <div className="flex justify-between"><span className="text-secondary">Bangladesh</span><span className="text-primary">500 kWh/capita</span></div>
                  </div>
                </div>
              </div>
            </div>

            <p className="text-secondary leading-relaxed mb-6">
              This isn&apos;t correlation without causation - it&apos;s causation. You can&apos;t run factories without electricity. You can&apos;t power hospitals without electricity. You can&apos;t operate data centers without electricity. Prosperity requires abundant, affordable, reliable energy.
            </p>

            <h3 className="text-lg font-medium text-primary mb-3">What Energy Powers</h3>
            <p className="text-secondary leading-relaxed mb-4">
              Most people think of energy as &quot;keeping the lights on.&quot; But energy powers everything:
            </p>

            <ul className="text-secondary space-y-3 mb-6">
              <li><span className="text-primary">Manufacturing & Industry (40% of electricity):</span> Steel production requires 5,000 kWh/tonne, aluminum 15,000 kWh/tonne. These create jobs, exports, and competitiveness.</li>
              <li><span className="text-primary">Food System:</span> Fertilizer production, farm equipment, irrigation, processing, and the cold chain. Result: 8 billion people fed (vs 1 billion in 1800).</li>
              <li><span className="text-primary">Healthcare:</span> 24/7 hospital power, vaccine production and storage, medical imaging and research. Life expectancy has doubled in a century.</li>
              <li><span className="text-primary">Clean Water:</span> Treatment plants, pumping, distribution, desalination. Diseases like cholera and typhoid eliminated in developed nations.</li>
              <li><span className="text-primary">Technology:</span> Data centers running 24/7, telecommunications networks, cloud services. The entire digital economy.</li>
              <li><span className="text-primary">Transportation:</span> EV charging, electric rail, urban transit. Increasingly electrifying.</li>
            </ul>

            <h3 className="text-lg font-medium text-primary mb-3">The Harsh Reality</h3>
            <p className="text-secondary leading-relaxed mb-4">
              Countries with unreliable electricity cannot compete economically.
            </p>
            <p className="text-secondary leading-relaxed mb-4">
              South Africa (2023): 300+ days of load-shedding. GDP growth: 0.7%. Unemployment: 33%. Manufacturing declining for a decade. Foreign investment fleeing.
            </p>
            <p className="text-secondary leading-relaxed mb-4">
              Pakistan (2023): Textile factories forced to close during blackouts. Lost orders to Bangladesh and Vietnam. Billions in export revenue lost. Hundreds of thousands of jobs gone.
            </p>
            <p className="text-secondary leading-relaxed">
              The lesson: Energy isn&apos;t just infrastructure - it&apos;s economic survival.
            </p>
          </section>

          {/* Section 2: The Price of Energy */}
          <section id="price">
            <h2 className="text-xl font-semibold text-primary mb-6">2. The Price of Energy IS the Price of Everything</h2>

            <h3 className="text-lg font-medium text-primary mb-3">Understanding the Ripple Effect</h3>
            <p className="text-secondary leading-relaxed mb-6">
              When energy prices rise, everything costs more. This isn&apos;t abstract economics - it&apos;s your grocery bill, your rent, your job security.
            </p>

            <h3 className="text-lg font-medium text-primary mb-3">The 2022 European Energy Crisis</h3>
            <p className="text-secondary leading-relaxed mb-4">
              Russia reduced natural gas exports to Europe. Gas prices went from €20/MWh to €200/MWh - a 10x increase. Electricity prices followed.
            </p>

            <p className="text-secondary leading-relaxed mb-4">
              The cascading impact:
            </p>

            <ul className="text-secondary space-y-3 mb-6">
              <li><span className="text-primary">Household bills:</span> Average German households went from €100/month to €300-500/month. Many faced energy poverty and difficult choices between heat and food.</li>
              <li><span className="text-primary">Industrial shutdown:</span> Fertilizer plants shut down (gas is both feedstock and energy). Chemical plants curtailed production. Aluminum smelters closed permanently. Jobs lost forever.</li>
              <li><span className="text-primary">Food prices:</span> High gas prices → expensive fertilizer → higher farm costs → food prices up 15-20% → cost of living crisis. UK food bank usage increased 30%.</li>
              <li><span className="text-primary">Business competitiveness:</span> European factories paying €200/MWh couldn&apos;t compete with US factories at €100/MWh or Chinese at €70/MWh. Production moved abroad. Permanent job losses.</li>
            </ul>

            <h3 className="text-lg font-medium text-primary mb-3">Why This Matters to Regular People</h3>
            <p className="text-secondary leading-relaxed mb-4">
              The abstract version: &quot;Energy policy affects macroeconomic competitiveness.&quot;
            </p>
            <p className="text-secondary leading-relaxed mb-6">
              The reality: Your electricity bill tripled. Your grocery costs rose 20%. Your company closed the local factory. Your neighbor lost their job.
            </p>

            <p className="text-secondary leading-relaxed mb-4">
              This is why energy policy isn&apos;t just for experts - it affects everyone. High energy costs don&apos;t just hurt in the moment. They cause permanent economic scarring: factories close and don&apos;t come back, investment goes elsewhere, engineers move to countries with better jobs, and competitive disadvantage becomes structural.
            </p>

            <p className="text-secondary leading-relaxed">
              Your children will inherit an economy shaped by today&apos;s energy decisions. If heavy industry leaves, those jobs don&apos;t come back for a generation.
            </p>
          </section>

          {/* Section 3: Energy Security IS National Security */}
          <section id="security">
            <h2 className="text-xl font-semibold text-primary mb-6">3. Energy Security IS National Security</h2>

            <h3 className="text-lg font-medium text-primary mb-3">The Geopolitical Reality</h3>
            <p className="text-secondary leading-relaxed mb-6">
              Energy dependence gives other countries leverage over you. This isn&apos;t paranoid - it&apos;s just how power works.
            </p>

            <h3 className="text-lg font-medium text-primary mb-3">Historical Examples</h3>

            <p className="text-secondary leading-relaxed mb-4">
              The 1970s Oil Embargos: In 1973, OPEC imposed an oil embargo against Western nations. Oil prices quadrupled from $3/barrel to $12/barrel. Gas lines stretched for miles in the USA. Rationing in Europe. Economic recession hit both continents. The era of &quot;stagflation&quot; (inflation + unemployment) began. Global power dynamics shifted overnight. Lesson: Whoever controls your energy can control your economy.
            </p>

            <p className="text-secondary leading-relaxed mb-4">
              Russia-Europe Gas Relationship (2000-2022): Europe, especially Germany, became heavily dependent on Russian gas - about 55% of Germany&apos;s gas came from Russia by 2021. This was justified as &quot;economic interdependence promotes peace.&quot; The reality proved different: gas was cut to Ukraine in 2006 and 2009 during pricing disputes, threats intensified after Crimea in 2014, and in 2022 after the Ukraine invasion, gas was weaponized completely.
            </p>

            <p className="text-secondary leading-relaxed mb-6">
              &quot;Economic interdependence&quot; with an adversary is just dependency. Germany&apos;s former Chancellor Schröder went to work for Gazprom. The policy was compromised from the start.
            </p>

            <h3 className="text-lg font-medium text-primary mb-3">The Leverage Mechanism</h3>
            <p className="text-secondary leading-relaxed mb-6">
              Country A depends on B for energy → B threatens to cut supplies → A&apos;s sovereignty is compromised. This isn&apos;t theory - it&apos;s happened repeatedly throughout history.
            </p>

            <h3 className="text-lg font-medium text-primary mb-3">Modern Examples</h3>
            <p className="text-secondary leading-relaxed mb-4">
              China controls 70% of global rare earth production. These materials are critical for wind turbines, EVs, and electronics. In 2010, China restricted exports during a dispute with Japan. Japan backed down politically. Lesson: Supply chain control is power.
            </p>
            <p className="text-secondary leading-relaxed mb-6">
              Japan in WWII had no domestic oil. The US oil embargo in 1941 crippled the Japanese military. Japan attacked Pearl Harbor partly to secure oil in Southeast Asia. Lesson: Energy dependence can lead to war.
            </p>

            <h3 className="text-lg font-medium text-primary mb-3">The Uncomfortable Truth</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <p className="text-secondary mb-2">Energy independence guarantees:</p>
                <ul className="text-secondary space-y-1 text-sm">
                  <li>• No foreign country can cut your supply</li>
                  <li>• Political decisions remain yours</li>
                  <li>• Economic resilience during crises</li>
                  <li>• Strategic autonomy in foreign policy</li>
                </ul>
              </div>
              <div>
                <p className="text-secondary mb-2">Energy dependence means:</p>
                <ul className="text-secondary space-y-1 text-sm">
                  <li>• Suppliers can threaten cutoffs</li>
                  <li>• Economy hostage to others&apos; decisions</li>
                  <li>• Foreign policy constrained</li>
                  <li>• National security compromised</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Section 4: Policy Decisions That Shape Our Future */}
          <section id="policy">
            <h2 className="text-xl font-semibold text-primary mb-6">4. The Policy Decisions That Shape Our Future</h2>

            <h3 className="text-lg font-medium text-primary mb-3">Why Energy Policy Matters More Than You Think</h3>
            <p className="text-secondary leading-relaxed mb-4">
              Most people don&apos;t think about energy policy until their electricity bill spikes. But energy decisions made today will shape your children&apos;s job prospects, your country&apos;s economic competitiveness, your national security posture, and your household budget for decades.
            </p>
            <p className="text-secondary leading-relaxed mb-6">
              These aren&apos;t &quot;future problems&quot; - they&apos;re happening now.
            </p>

            <h3 className="text-lg font-medium text-primary mb-3">Case Study: Germany&apos;s Energiewende (2011-2024)</h3>
            <p className="text-secondary leading-relaxed mb-4">
              After Fukushima in 2011, Germany decided to shut down all nuclear plants by 2022, replace them with renewables, and achieve climate leadership.
            </p>
            <p className="text-secondary leading-relaxed mb-4">
              The successes: Renewable electricity grew from 20% to 52%. Massive wind and solar build-out. Proved renewables can scale.
            </p>
            <p className="text-secondary leading-relaxed mb-4">
              The failures: Gas dependency increased from 35% to 55%. Electricity prices became 3x USA prices. When Russia cut gas, an economic crisis ensued. Coal use actually increased to replace nuclear. Climate goals were compromised.
            </p>
            <p className="text-secondary leading-relaxed mb-6">
              What went wrong? Nuclear was shut down before alternatives were ready. Intermittent renewables required gas backup. Gas dependence created geopolitical vulnerability. High costs hurt industrial competitiveness. The lesson: Good intentions don&apos;t equal good outcomes. Energy policy is complex.
            </p>

            <h3 className="text-lg font-medium text-primary mb-3">Case Study: France&apos;s Nuclear Bet (1970s-Present)</h3>
            <p className="text-secondary leading-relaxed mb-4">
              After the 1973 oil crisis, France went all-in on nuclear power. They built 50+ reactors in 25 years.
            </p>
            <p className="text-secondary leading-relaxed mb-4">
              The successes: Nuclear now provides 70% of electricity. Prices are among the lowest in Europe. CO₂ emissions are 50g/kWh vs Germany&apos;s 350g. Industrial competitiveness remains strong.
            </p>
            <p className="text-secondary leading-relaxed mb-4">
              The challenges: 100% uranium imports. Aging fleet with maintenance issues. New builds are expensive and delayed. Waste requires long-term storage.
            </p>
            <p className="text-secondary leading-relaxed mb-6">
              The lesson: Strategic energy decisions have 50-year consequences. France made a bet in the 1970s that still defines their economy today - mostly positively.
            </p>

            <h3 className="text-lg font-medium text-primary mb-3">The Common Pattern</h3>
            <p className="text-secondary leading-relaxed mb-4">
              Energy policy decisions have long time horizons: Nuclear plants last 60+ years. Gas pipelines last 40+ years. Renewable infrastructure lasts 20-30 years. Fuel dependencies can&apos;t easily be reversed.
            </p>
            <p className="text-secondary leading-relaxed">
              Once you make a choice, you live with it for decades. There are no perfect answers - only trade-offs.
            </p>
          </section>

          {/* Section 5: Current Decisions */}
          <section id="current">
            <h2 className="text-xl font-semibold text-primary mb-6">5. The Decisions Being Made Right Now</h2>

            <h3 className="text-lg font-medium text-primary mb-3">Why This Moment Matters</h3>
            <p className="text-secondary leading-relaxed mb-4">
              The 2020s are a critical decade for energy policy worldwide. Climate commitments are accelerating the energy transition. Geopolitical tensions are reshaping energy trade. Technology costs are changing what&apos;s possible.
            </p>
            <p className="text-secondary leading-relaxed mb-6">
              Decisions made now will define 2050-2070. Your elected officials are making these decisions right now. Are they making them wisely?
            </p>

            <h3 className="text-lg font-medium text-primary mb-3">Current Global Trends</h3>

            <p className="text-secondary leading-relaxed mb-4">
              The Renewable Energy Transition: Solar and wind costs have fallen 90% in a decade. Many countries are committing to &quot;net zero&quot; by 2050. But challenges remain: intermittency (sun and wind aren&apos;t constant), grid stability requiring backup or storage, manufacturing concentrated in China, and massive material requirements for copper, lithium, and rare earths.
            </p>

            <p className="text-secondary leading-relaxed mb-4">
              The Nuclear Question: Some countries are reconsidering nuclear (France, UK, Poland). Others are doubling down on phase-out (Germany, Belgium). New SMR technologies are in development. The debates center on safety, waste, cost, and time to build.
            </p>

            <p className="text-secondary leading-relaxed mb-6">
              Electrification of Everything: EVs are replacing combustion cars. Heat pumps are replacing gas boilers. Electric furnaces and green hydrogen are being developed for industry. Result: Electricity demand could double by 2050. We need to build generation capacity and grid infrastructure, transition away from fossil fuels, maintain reliability, and keep costs reasonable - all at the same time.
            </p>

            <h3 className="text-lg font-medium text-primary mb-3">Policy Choices Being Made Now</h3>
            <div className="grid md:grid-cols-2 gap-6 mb-4">
              <div>
                <p className="text-secondary mb-2">Energy Mix:</p>
                <ul className="text-sm text-secondary space-y-1">
                  <li>• Close coal plants? When?</li>
                  <li>• Keep nuclear or phase out?</li>
                  <li>• How much renewable? How fast?</li>
                  <li>• What provides backup?</li>
                </ul>
              </div>
              <div>
                <p className="text-secondary mb-2">Dependencies:</p>
                <ul className="text-sm text-secondary space-y-1">
                  <li>• Accept gas imports? From whom?</li>
                  <li>• Import solar panels from China?</li>
                  <li>• Buy uranium from Kazakhstan?</li>
                  <li>• Rely on undersea cables?</li>
                </ul>
              </div>
            </div>
            <p className="text-secondary leading-relaxed">
              These decisions will shape your electricity bills, your country&apos;s industrial base, your children&apos;s job opportunities, and your national security posture - for decades.
            </p>
          </section>

          {/* Section 6: What You Can Do */}
          <section id="action">
            <h2 className="text-xl font-semibold text-primary mb-6">6. What You Can Do</h2>

            <h3 className="text-lg font-medium text-primary mb-3">Follow the Numbers</h3>
            <p className="text-secondary leading-relaxed mb-4">
              When politicians talk about energy, ask: What&apos;s the total cost (not just generation)? Where does reliability come from? What are the dependencies? What&apos;s the timeline? Who bears the costs?
            </p>
            <p className="text-secondary leading-relaxed mb-6">
              Red flags to watch for: Promises with no cost estimates. &quot;Just build more renewables&quot; with no backup plan. Closing reliable plants with no replacement ready. Claims of &quot;energy independence&quot; while increasing imports.
            </p>

            <h3 className="text-lg font-medium text-primary mb-3">Understand Trade-offs</h3>
            <p className="text-secondary leading-relaxed mb-4">
              There are no perfect energy solutions. Every choice has trade-offs:
            </p>
            <ul className="text-secondary space-y-2 mb-6">
              <li>Coal: Cheap, reliable, abundant - but CO₂ and air pollution</li>
              <li>Gas: Cleaner than coal, flexible - but CO₂ and import dependency</li>
              <li>Nuclear: Low carbon, reliable, dense - but waste, upfront cost, public fear</li>
              <li>Solar/Wind: Clean, falling costs - but intermittent, land use</li>
              <li>Hydro: Clean, reliable, storage - but geographic limits, ecosystem impact</li>
            </ul>
            <p className="text-secondary leading-relaxed mb-6">
              Be skeptical of anyone claiming their solution has no trade-offs.
            </p>

            <h3 className="text-lg font-medium text-primary mb-3">Questions to Ask Your Representatives</h3>
            <p className="text-secondary leading-relaxed mb-4">
              Basic questions: What is our energy independence score, and why? What percentage of electricity comes from imports? What happens if our main supplier cuts us off? How will this affect electricity prices?
            </p>
            <p className="text-secondary leading-relaxed mb-6">
              Policy-specific: If we close this plant, what replaces it and when? If we buy panels from China, what&apos;s the risk? How much will this cost in total, and who pays? What&apos;s the plan if this doesn&apos;t work?
            </p>
            <p className="text-secondary leading-relaxed">
              Don&apos;t accept vague answers. Demand specifics.
            </p>
          </section>

          {/* Section 7: The Path Forward */}
          <section id="forward">
            <h2 className="text-xl font-semibold text-primary mb-6">7. The Path Forward</h2>

            <h3 className="text-lg font-medium text-primary mb-3">What Good Energy Policy Looks Like</h3>
            <p className="text-secondary leading-relaxed mb-4">
              Good energy policy balances: Affordability (reasonable costs), Reliability (24/7 availability), Security (minimize dependencies), Sustainability (environmental concerns), and Realism (engineering reality).
            </p>
            <p className="text-secondary leading-relaxed mb-6">
              This is the Energy Trilemma: You can&apos;t maximize all at once. Trade-offs are inevitable.
            </p>

            <h3 className="text-lg font-medium text-primary mb-3">What Bad Energy Policy Looks Like</h3>
            <p className="text-secondary leading-relaxed mb-6">
              Warning signs: Closing reliable plants before replacements are ready. Creating new dependencies while claiming &quot;independence.&quot; Ignoring costs or pushing them to future generations. Ideology over engineering (from both left and right). Short-term thinking based on election cycles rather than decades. Assuming technology miracles will save us.
            </p>

            <h3 className="text-lg font-medium text-primary mb-3">Countries Getting It (Mostly) Right</h3>
            <p className="text-secondary leading-relaxed mb-4">
              Norway: Leveraged natural hydro resources. 95%+ renewable electricity. Achieved energy independence, security, and affordability. Lesson: Use your natural advantages.
            </p>
            <p className="text-secondary leading-relaxed mb-4">
              France: Made a long-term nuclear bet in the 1970s. Reliable, low-cost, low-carbon electricity for 50 years. Lesson: Long-term thinking pays off.
            </p>
            <p className="text-secondary leading-relaxed mb-6">
              Poland: Diversifying away from Russian gas. Building nuclear. Developing offshore wind. Maintaining coal as backup during transition. Lesson: Security first, then transition.
            </p>

            <h3 className="text-lg font-medium text-primary mb-3">The Hope</h3>
            <p className="text-secondary leading-relaxed mb-4">
              Good news: Technology is improving. Costs are falling. Awareness is rising (2022 was a wake-up call). Solutions exist.
            </p>
            <p className="text-secondary leading-relaxed">
              The challenge: We need to build faster than ever, while maintaining reliability, while managing costs, while navigating geopolitics. It&apos;s hard, but doable - if we&apos;re smart about it.
            </p>
          </section>

          {/* Section 8: Final Thoughts */}
          <section id="final">
            <h2 className="text-xl font-semibold text-primary mb-6">8. Final Thoughts</h2>

            <h3 className="text-lg font-medium text-primary mb-3">The Core Message</h3>
            <p className="text-secondary leading-relaxed mb-4">
              Energy is not just another policy issue. Energy is the foundation of prosperity, the basis of national security, the determinant of quality of life, and the shape of the future we&apos;re building.
            </p>
            <p className="text-secondary leading-relaxed mb-6">
              When energy works, economies grow, people prosper, countries stay secure, and futures look bright. When energy fails, economies contract, people suffer, countries become vulnerable, and futures look dark. It really is that fundamental.
            </p>

            <h3 className="text-lg font-medium text-primary mb-3">Why Hyperion Exists</h3>
            <p className="text-secondary leading-relaxed mb-6">
              We built Hyperion because energy policy deserves serious, honest, data-driven analysis. We believe transparency beats propaganda, data beats ideology, long-term thinking beats short-term politics, and informed citizens make better democracies.
            </p>

            <QuoteBlock>
              If you take one thing from this page: Energy policy matters more than you think. It affects your wallet, your job, your security, your children&apos;s future. Pay attention to it. Ask questions about it. Vote with it in mind. Because the decisions being made right now will echo for decades.
            </QuoteBlock>

            <h3 className="text-lg font-medium text-primary mb-4">Three Things You Can Do Right Now</h3>
            <div className="grid md:grid-cols-3 gap-4 mb-8">
              <div className="card p-5 text-center">
                <div className="text-3xl mb-2">🔍</div>
                <h4 className="font-medium text-primary mb-2">1. Explore Your Country</h4>
                <p className="text-sm text-secondary mb-3">Use Hyperion to understand your country&apos;s energy reality</p>
                <Link href="/" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
                  Explore the map →
                </Link>
              </div>
              <div className="card p-5 text-center">
                <div className="text-3xl mb-2">❓</div>
                <h4 className="font-medium text-primary mb-2">2. Ask Questions</h4>
                <p className="text-sm text-secondary">Next time you hear an energy proposal, ask about costs, backup plans, dependencies</p>
              </div>
              <div className="card p-5 text-center">
                <div className="text-3xl mb-2">📤</div>
                <h4 className="font-medium text-primary mb-2">3. Share This</h4>
                <p className="text-sm text-secondary">Send this to someone who cares about the future - parents, teachers, anyone who pays an electricity bill</p>
              </div>
            </div>

            <div className="text-center py-6">
              <p className="text-lg text-primary font-medium mb-2">Energy is too important for apathy.</p>
              <p className="text-secondary">Get informed. Ask questions. Demand better.</p>
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
