'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

interface CollapsibleSectionProps {
  title: string;
  id: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

function CollapsibleSection({ title, id, defaultOpen = false, children }: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <section id={id} className="border-b border-border last:border-b-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-3 flex items-center justify-between text-left hover:bg-inset transition-colors rounded-lg px-2 -mx-2"
        aria-expanded={isOpen}
      >
        <h2 className="text-sm font-medium text-primary">{title}</h2>
        <svg
          className={`w-4 h-4 text-muted transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {isOpen && (
        <div className="pb-4 space-y-3">
          {children}
        </div>
      )}
    </section>
  );
}

function InfoCard({ title, children, variant = 'default' }: { title?: string; children: React.ReactNode; variant?: 'default' | 'warning' | 'success' }) {
  const borderColors = {
    default: 'border-l-blue-500',
    warning: 'border-l-yellow-500',
    success: 'border-l-green-500',
  };

  return (
    <div className={`card p-3 border-l-4 ${borderColors[variant]}`}>
      {title && <h4 className="text-xs font-semibold text-primary mb-1.5">{title}</h4>}
      <div className="text-xs text-secondary">{children}</div>
    </div>
  );
}

function CodeBlock({ children, title }: { children: string; title?: string }) {
  return (
    <div className="bg-inset rounded-lg overflow-hidden">
      {title && (
        <div className="px-3 py-1.5 text-[10px] font-medium text-muted border-b border-border">
          {title}
        </div>
      )}
      <pre className="p-3 text-[11px] font-mono text-secondary overflow-x-auto">
        {children}
      </pre>
    </div>
  );
}

function FormulaBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-inset border border-border rounded-lg p-3 font-mono text-xs text-primary">
      {children}
    </div>
  );
}

export default function MethodologyPage() {
  return (
    <div className="min-h-screen bg-canvas flex flex-col">
      <Header currentPage="methodology" />

      <main className="flex-1 py-8">
        <div className="prose">
        {/* Hero Section */}
        <div className="mb-8">
          <h1 className="text-xl font-semibold text-primary mb-2">How Grid Gorilla Works</h1>
          <p className="text-sm text-secondary leading-relaxed">
            Understanding our data, calculations, and energy independence methodology
          </p>
        </div>

        {/* Quick Navigation */}
        <nav className="card p-3 mb-6">
          <h3 className="text-xs font-semibold text-primary mb-2">Quick Navigation</h3>
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'mission', label: 'Our Mission' },
              { id: 'data-sources', label: 'Data Sources' },
              { id: 'methodology', label: 'Independence Score' },
              { id: 'calculation', label: 'Calculation' },
              { id: 'examples', label: 'Worked Examples' },
              { id: 'limitations', label: 'Limitations' },
              { id: 'faq', label: 'FAQ' },
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

        <div className="space-y-0">
          {/* Section 1: Our Mission */}
          <CollapsibleSection title="Our Mission" id="mission" defaultOpen={true}>
            <p className="text-sm text-secondary leading-relaxed">
              Grid Gorilla exists to provide honest, data-driven insights into global energy systems. We believe that{' '}
              <strong className="text-primary">energy abundance is the foundation of economic prosperity</strong>{' '}
              and that understanding energy independence is critical to evaluating national security and economic resilience.
            </p>
            <p className="text-sm text-secondary leading-relaxed">
              Unlike many energy dashboards that show only production or consumption, Grid Gorilla reveals the{' '}
              <strong className="text-primary">reality behind the numbers</strong>: where energy actually comes from,
              who controls it, and what that means for geopolitical stability.
            </p>

            <div className="grid sm:grid-cols-2 gap-4 mt-6">
              <div className="card p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">🎯</span>
                  <h4 className="font-semibold text-primary text-sm">Honest</h4>
                </div>
                <p className="text-xs text-secondary">
                  We don't hide import dependencies or overstate &quot;green&quot; credentials
                </p>
              </div>
              <div className="card p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">📊</span>
                  <h4 className="font-semibold text-primary text-sm">Data-driven</h4>
                </div>
                <p className="text-xs text-secondary">
                  Every metric is traceable to authoritative sources
                </p>
              </div>
              <div className="card p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">🌍</span>
                  <h4 className="font-semibold text-primary text-sm">Educational</h4>
                </div>
                <p className="text-xs text-secondary">
                  We explain the &quot;why&quot; behind energy policy decisions
                </p>
              </div>
              <div className="card p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">🔓</span>
                  <h4 className="font-semibold text-primary text-sm">Open</h4>
                </div>
                <p className="text-xs text-secondary">
                  Our methodology is transparent and our data sources are cited
                </p>
              </div>
            </div>
          </CollapsibleSection>

          {/* Section 2: Data Sources */}
          <CollapsibleSection title="Data Sources" id="data-sources">
            <p className="text-sm text-secondary leading-relaxed mb-6">
              Grid Gorilla combines data from multiple authoritative sources to provide a complete picture of global energy systems.
              All data is freely available and regularly updated.
            </p>

            {/* Ember Climate */}
            <div className="card p-5 mb-4">
              <div className="flex items-start justify-between mb-3">
                <h4 className="font-semibold text-primary">Ember Climate</h4>
                <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-1 rounded-full">
                  Electricity Generation
                </span>
              </div>
              <p className="text-sm text-secondary mb-3">
                Electricity generation by source (coal, gas, nuclear, solar, wind, etc.)
              </p>
              <div className="grid sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-muted">Coverage:</span>
                  <ul className="mt-1 space-y-1 text-secondary">
                    <li>• 200+ countries and territories</li>
                    <li>• Annual data from 2000-present</li>
                    <li>• Updated twice monthly</li>
                  </ul>
                </div>
                <div>
                  <span className="text-muted">Why we chose it:</span>
                  <ul className="mt-1 space-y-1 text-secondary">
                    <li>• Open data (CC BY 4.0 license)</li>
                    <li>• Excellent country coverage</li>
                    <li>• Cleaned and standardized</li>
                  </ul>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-border">
                <a
                  href="https://ember-climate.org/data/yearly-electricity-data/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                >
                  ember-climate.org/data/yearly-electricity-data →
                </a>
              </div>
            </div>

            {/* Our World in Data */}
            <div className="card p-5 mb-4">
              <div className="flex items-start justify-between mb-3">
                <h4 className="font-semibold text-primary">Our World in Data</h4>
                <span className="text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 px-2 py-1 rounded-full">
                  Fossil Fuel Production
                </span>
              </div>
              <p className="text-sm text-secondary mb-3">
                Primary energy production and consumption by fuel type (coal, natural gas, oil)
              </p>
              <div className="grid sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-muted">Coverage:</span>
                  <ul className="mt-1 space-y-1 text-secondary">
                    <li>• 200+ countries</li>
                    <li>• Annual data from 1965-present</li>
                    <li>• Covers coal, natural gas, and oil</li>
                  </ul>
                </div>
                <div>
                  <span className="text-muted">Why we chose it:</span>
                  <ul className="mt-1 space-y-1 text-secondary">
                    <li>• Open data (CC BY 4.0 license)</li>
                    <li>• Pre-cleaned and standardized</li>
                    <li>• Well-documented methodology</li>
                  </ul>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-border">
                <a
                  href="https://github.com/owid/energy-data"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                >
                  github.com/owid/energy-data →
                </a>
              </div>
            </div>

            {/* Uranium Data */}
            <div className="card p-5 mb-4">
              <div className="flex items-start justify-between mb-3">
                <h4 className="font-semibold text-primary">World Nuclear Association & EIA</h4>
                <span className="text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-2 py-1 rounded-full">
                  Uranium Production
                </span>
              </div>
              <p className="text-sm text-secondary mb-3">
                Uranium mining production by country
              </p>
              <p className="text-xs text-secondary mb-3">
                <strong className="text-primary">Key insight:</strong> Only ~15 countries produce uranium. Everyone else imports 100%.
              </p>
              <div className="mt-4 pt-3 border-t border-border flex flex-wrap gap-4">
                <a
                  href="https://world-nuclear.org/information-library/nuclear-fuel-cycle/mining-of-uranium/world-uranium-mining-production"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                >
                  World Nuclear Association →
                </a>
                <a
                  href="https://www.eia.gov/uranium/marketing/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                >
                  US EIA Uranium Reports →
                </a>
              </div>
            </div>

            {/* Socioeconomic Data */}
            <div className="card p-5">
              <div className="flex items-start justify-between mb-3">
                <h4 className="font-semibold text-primary">World Bank & UNDP</h4>
                <span className="text-xs bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 px-2 py-1 rounded-full">
                  Socioeconomic Data
                </span>
              </div>
              <p className="text-sm text-secondary mb-3">
                GDP, Human Development Index (HDI), life expectancy, and manufacturing output for our Energy & Prosperity correlations
              </p>
              <div className="grid sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-muted">Metrics:</span>
                  <ul className="mt-1 space-y-1 text-secondary">
                    <li>• GDP per capita (PPP adjusted)</li>
                    <li>• Human Development Index (HDI)</li>
                    <li>• Life expectancy at birth</li>
                    <li>• Manufacturing value per capita</li>
                  </ul>
                </div>
                <div>
                  <span className="text-muted">Why we chose it:</span>
                  <ul className="mt-1 space-y-1 text-secondary">
                    <li>• Authoritative global coverage</li>
                    <li>• Standardized methodology</li>
                    <li>• Annual updates</li>
                  </ul>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-border flex flex-wrap gap-4">
                <a
                  href="https://data.worldbank.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                >
                  World Bank Open Data →
                </a>
                <a
                  href="https://hdr.undp.org/data-center"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                >
                  UNDP Human Development Data →
                </a>
              </div>
            </div>
          </CollapsibleSection>

          {/* Section 3: Energy Independence Score */}
          <CollapsibleSection title="Energy Independence Score - Detailed Methodology" id="methodology">
            <h3 className="text-sm font-semibold text-primary mb-2">What is Energy Independence?</h3>
            <p className="text-sm text-secondary leading-relaxed mb-4">
              <strong className="text-primary">Energy Independence</strong> measures how much of a country's electricity
              generation comes from domestic sources versus imported fuels.
            </p>

            <InfoCard variant="warning" title="Key Principle">
              A country generating 1000 TWh of electricity from imported natural gas is NOT energy independent,
              even though it &quot;produces&quot; lots of electricity.
            </InfoCard>

            <h3 className="text-sm font-semibold text-primary mt-6 mb-2">Why Energy Independence Matters</h3>
            <p className="text-sm text-secondary leading-relaxed mb-4">
              The 2022 European energy crisis demonstrated the vulnerability of energy dependence:
            </p>
            <ul className="list-disc list-inside space-y-1 text-sm text-secondary mb-4">
              <li>Russia reduced gas exports to Europe</li>
              <li>Electricity prices spiked 10x in some markets</li>
              <li>Industrial production declined</li>
              <li>Political leverage shifted</li>
            </ul>

            <InfoCard>
              <strong className="text-primary">Energy independence ≠ Energy security</strong>, but it&apos;s a critical component.
            </InfoCard>

            <h3 className="text-sm font-semibold text-primary mt-6 mb-2">The Three Calculation Layers</h3>
            <p className="text-sm text-secondary leading-relaxed mb-4">
              Our Energy Independence Score has three progressive layers of sophistication:
            </p>

            {/* Layer 1 */}
            <div className="card p-5 mb-4">
              <h4 className="font-semibold text-primary mb-2">Layer 1: Renewable & Nuclear Baseline</h4>
              <p className="text-sm text-secondary mb-3">
                Renewable energy sources are 100% domestic by definition.
              </p>
              <CodeBlock title="Renewable sources (100% independent)">
{`Solar     → Sunlight falls on domestic land
Wind      → Wind blows in domestic airspace/waters
Hydro     → Water falls in domestic rivers
Geothermal → Heat from domestic underground
Bioenergy → Crops grown on domestic land`}
              </CodeBlock>
              <p className="text-xs text-muted mt-3">
                <strong>Nuclear:</strong> Initially counted as 100% independent, but see Layer 3 below.
              </p>
            </div>

            {/* Layer 2 */}
            <div className="card p-5 mb-4">
              <h4 className="font-semibold text-primary mb-2">Layer 2: Fossil Fuel Import Dependency</h4>
              <p className="text-sm text-secondary mb-3">
                A country might generate electricity from coal, but where did the coal come from?
                We use production/consumption ratios from Our World in Data.
              </p>
              <CodeBlock title="Formula">
{`fuel_independence = domestic_production / domestic_consumption

Examples:
Germany coal: 140 TWh produced / 280 TWh consumed = 50% independent
Germany gas:  20 TWh produced / 850 TWh consumed  = 2.4% independent
Norway gas:   1200 TWh produced / 50 TWh consumed = 2400% → capped at 100%`}
              </CodeBlock>
              <p className="text-xs text-muted mt-3">
                <strong>Assumption:</strong> We assume the import ratio is consistent across all sectors (electricity, heating, transport, industry).
              </p>
            </div>

            {/* Layer 3 */}
            <div className="card p-5">
              <h4 className="font-semibold text-primary mb-2">Layer 3: Nuclear Fuel Dependency</h4>
              <p className="text-sm text-secondary mb-3">
                Nuclear plants need uranium fuel. Where does it come from?
                Only ~15 countries mine uranium. France, Japan, Germany, South Korea, etc. produce zero uranium domestically.
              </p>
              <CodeBlock title="Uranium Independence Lookup Table">
{`Major Producers (100% independent):
  Kazakhstan: 43% of world production
  Canada: 15% of world production
  Namibia: 11% of world production
  Australia: 8% of world production
  Russia: 5% of world production

Partial Producers:
  China: 50% (produces ~half of needs)
  India: 30% (produces some, imports most)
  Ukraine: 50%
  USA: 1% (produces <1%, imports 99%)

Everyone Else: 0% (imports 100%)
  France, Germany, Japan, UK, South Korea,
  Spain, Belgium, Sweden, Finland, etc.`}
              </CodeBlock>
            </div>
          </CollapsibleSection>

          {/* Section 4: The Complete Calculation */}
          <CollapsibleSection title="The Complete Calculation" id="calculation">
            <h3 className="text-sm font-semibold text-primary mb-2">Step-by-Step Formula</h3>

            <div className="space-y-4">
              <div className="card p-5">
                <h4 className="font-semibold text-primary mb-2">Step 1: Calculate Renewable Contribution</h4>
                <p className="text-sm text-muted mb-3">(100% independent)</p>
                <FormulaBox>
                  <div>renewable_electricity = solar + wind + hydro + bioenergy + other_renewables</div>
                  <div className="mt-2">renewable_contribution = (renewable_electricity / total_electricity) × 100</div>
                </FormulaBox>
              </div>

              <div className="card p-5">
                <h4 className="font-semibold text-primary mb-2">Step 2: Calculate Fossil Fuel Contributions</h4>
                <p className="text-sm text-muted mb-3">(weighted by import dependency)</p>
                <FormulaBox>
                  <div className="text-muted text-xs mb-2">// For each fossil fuel (coal, gas, oil):</div>
                  <div>fuel_independence_ratio = fuel_production / fuel_consumption</div>
                  <div className="mt-2 text-muted text-xs">// Cap at 100% for net exporters</div>
                  <div>if (fuel_independence_ratio {'>'} 1.0) fuel_independence_ratio = 1.0</div>
                  <div className="mt-3">coal_contribution = (coal_elec / total_elec) × coal_independence × 100</div>
                  <div>gas_contribution = (gas_elec / total_elec) × gas_independence × 100</div>
                  <div>oil_contribution = (oil_elec / total_elec) × oil_independence × 100</div>
                </FormulaBox>
              </div>

              <div className="card p-5">
                <h4 className="font-semibold text-primary mb-2">Step 3: Calculate Nuclear Contribution</h4>
                <p className="text-sm text-muted mb-3">(weighted by uranium independence)</p>
                <FormulaBox>
                  <div>uranium_independence = URANIUM_LOOKUP_TABLE[country_code] || 0</div>
                  <div className="mt-2">nuclear_contribution = (nuclear_elec / total_elec) × (uranium_independence / 100) × 100</div>
                </FormulaBox>
              </div>

              <div className="card p-5">
                <h4 className="font-semibold text-primary mb-2">Step 4: Sum All Contributions</h4>
                <FormulaBox>
                  <div>total_score = renewable_contribution + nuclear_contribution +</div>
                  <div className="ml-12">coal_contribution + gas_contribution + oil_contribution</div>
                  <div className="mt-2 text-muted text-xs">// Round to 1 decimal place</div>
                  <div>final_score = Math.round(total_score × 10) / 10</div>
                </FormulaBox>
              </div>

              <div className="card p-5">
                <h4 className="font-semibold text-primary mb-2">Step 5: Assign Score Band</h4>
                <div className="grid sm:grid-cols-5 gap-2 mt-4">
                  <div className="text-center p-3 rounded-lg" style={{ backgroundColor: '#059669' }}>
                    <div className="text-white font-bold text-lg">≥90</div>
                    <div className="text-white/90 text-xs">Energy Fortress</div>
                  </div>
                  <div className="text-center p-3 rounded-lg" style={{ backgroundColor: '#22C55E' }}>
                    <div className="text-white font-bold text-lg">70-89</div>
                    <div className="text-white/90 text-xs">Strong Position</div>
                  </div>
                  <div className="text-center p-3 rounded-lg" style={{ backgroundColor: '#EAB308' }}>
                    <div className="text-white font-bold text-lg">50-69</div>
                    <div className="text-white/90 text-xs">Moderate</div>
                  </div>
                  <div className="text-center p-3 rounded-lg" style={{ backgroundColor: '#F97316' }}>
                    <div className="text-white font-bold text-lg">30-49</div>
                    <div className="text-white/90 text-xs">Dependent</div>
                  </div>
                  <div className="text-center p-3 rounded-lg" style={{ backgroundColor: '#EF4444' }}>
                    <div className="text-white font-bold text-lg">{'<'}30</div>
                    <div className="text-white/90 text-xs">Critical</div>
                  </div>
                </div>
              </div>
            </div>
          </CollapsibleSection>

          {/* Section 5: Worked Examples */}
          <CollapsibleSection title="Worked Examples" id="examples">
            {/* Example 1: Germany */}
            <div className="card p-5 mb-6">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl">🇩🇪</span>
                <div>
                  <h4 className="font-semibold text-primary">Germany (2023)</h4>
                  <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: '#EAB308', color: 'white' }}>
                    Score: 68.7 - Moderate
                  </span>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4 text-xs mb-4">
                <div>
                  <h5 className="font-medium text-primary mb-2">Electricity Mix (Ember)</h5>
                  <ul className="space-y-1 text-secondary">
                    <li>Total: 508 TWh</li>
                    <li>Renewables: 255 TWh (50.2%)</li>
                    <li>Nuclear: 0 TWh (shut down April 2023)</li>
                    <li className="text-muted italic text-[10px] pl-3">Was 6% in 2022, 13.3% in 2021</li>
                    <li>Coal: 185 TWh (36.4%)</li>
                    <li>Gas: 66 TWh (13.0%)</li>
                  </ul>
                </div>
                <div>
                  <h5 className="font-medium text-primary mb-2">Fossil Fuel Independence (OWID)</h5>
                  <ul className="space-y-1 text-secondary">
                    <li>Coal: 140/280 TWh = 50%</li>
                    <li>Gas: 20/850 TWh = 2.4%</li>
                    <li>Oil: 10/1200 TWh = 0.8%</li>
                    <li>Uranium: 0% (no production)</li>
                  </ul>
                </div>
              </div>

              <CodeBlock title="Calculation">
{`Renewable contribution: (255/508) × 100 = 50.2 pts
Nuclear contribution:   (0/508) × 0% = 0 pts
Coal contribution:      (185/508) × 50% = 18.2 pts
Gas contribution:       (66/508) × 2.4% = 0.3 pts
Oil contribution:       (2/508) × 0.8% = 0.003 pts

TOTAL: 50.2 + 0 + 18.2 + 0.3 + 0.003 = 68.7 / 100`}
              </CodeBlock>

              <div className="grid sm:grid-cols-2 gap-4 mt-4">
                <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <h5 className="text-xs font-medium text-green-700 dark:text-green-400 mb-1">Strengths</h5>
                  <p className="text-xs text-green-600 dark:text-green-300">50% renewable electricity is fully independent</p>
                </div>
                <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <h5 className="text-xs font-medium text-red-700 dark:text-red-400 mb-1">Vulnerabilities</h5>
                  <p className="text-xs text-red-600 dark:text-red-300">Extreme gas dependency (imports 97.6%)</p>
                </div>
              </div>
            </div>

            {/* Example 2: France */}
            <div className="card p-5 mb-6">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl">🇫🇷</span>
                <div>
                  <h4 className="font-semibold text-primary">France (2023)</h4>
                  <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: '#EF4444', color: 'white' }}>
                    Score: 20.2 - Critical Dependency
                  </span>
                </div>
              </div>

              <InfoCard variant="warning" title="Wait, what?!">
                This is the most controversial calculation in Grid Gorilla, and it&apos;s intentionally provocative.
              </InfoCard>

              <div className="grid sm:grid-cols-2 gap-4 text-xs my-4">
                <div>
                  <h5 className="font-medium text-primary mb-2">Electricity Mix (Ember)</h5>
                  <ul className="space-y-1 text-secondary">
                    <li>Total: 445 TWh</li>
                    <li>Renewables: 90 TWh (20.2%)</li>
                    <li>Nuclear: 320 TWh (71.9%)</li>
                    <li>Coal: 5 TWh (1.1%)</li>
                    <li>Gas: 28 TWh (6.3%)</li>
                  </ul>
                </div>
                <div>
                  <h5 className="font-medium text-primary mb-2">Independence Ratios</h5>
                  <ul className="space-y-1 text-secondary">
                    <li>Coal: 0% (no domestic coal)</li>
                    <li>Gas: 0% (no domestic gas)</li>
                    <li>Oil: 0.6%</li>
                    <li className="text-negative">Uranium: 0% (imports from Niger, Kazakhstan, Canada)</li>
                  </ul>
                </div>
              </div>

              <CodeBlock title="Calculation">
{`Renewable contribution: (90/445) × 100 = 20.2 pts
Nuclear contribution:   (320/445) × 0% = 0 pts  ← Despite 72% nuclear!
Coal contribution:      (5/445) × 0% = 0 pts
Gas contribution:       (28/445) × 0% = 0 pts
Oil contribution:       (2/445) × 0.6% = 0.003 pts

TOTAL: 20.2 + 0 + 0 + 0 + 0.003 = 20.2 / 100`}
              </CodeBlock>

              <div className="mt-4 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                <h5 className="font-semibold text-amber-800 dark:text-amber-300 mb-2">Why we score it this way</h5>
                <ul className="text-xs text-amber-700 dark:text-amber-400 space-y-1">
                  <li>• Uranium dependency is real: France imports 100% of uranium ore</li>
                  <li>• Supply chain vulnerability: Uranium comes from politically unstable regions (Niger) or geopolitical competitors (Russia, Kazakhstan)</li>
                  <li>• Educational mission: We&apos;re measuring <em>independence</em>, not <em>security</em></li>
                </ul>

                <div className="mt-3 pt-3 border-t border-amber-200 dark:border-amber-700">
                  <h6 className="font-medium text-amber-800 dark:text-amber-300 mb-1">Important Distinction:</h6>
                  <ul className="text-xs text-amber-700 dark:text-amber-400 space-y-1">
                    <li>Energy Security: France HAS this (reliable nuclear fleet, diversified uranium suppliers, strategic fuel reserves)</li>
                    <li>Energy Independence: France LACKS this (zero uranium mining, zero fossil fuel production)</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Example 3: Norway */}
            <div className="card p-5 mb-6">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl">🇳🇴</span>
                <div>
                  <h4 className="font-semibold text-primary">Norway (2023)</h4>
                  <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: '#059669', color: 'white' }}>
                    Score: 97.4 - Energy Fortress
                  </span>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4 text-xs mb-4">
                <div>
                  <h5 className="font-medium text-primary mb-2">Electricity Mix (Ember)</h5>
                  <ul className="space-y-1 text-secondary">
                    <li>Total: 155 TWh</li>
                    <li>Renewables: 148 TWh (95.5%)</li>
                    <li>Gas: 3 TWh (1.9%)</li>
                  </ul>
                </div>
                <div>
                  <h5 className="font-medium text-primary mb-2">Fossil Fuel Independence</h5>
                  <ul className="space-y-1 text-secondary">
                    <li>Gas: 1200/50 TWh = 2400% → capped at 100%</li>
                    <li>Oil: 2000/200 TWh = 1000% → capped at 100%</li>
                  </ul>
                </div>
              </div>

              <CodeBlock title="Calculation">
{`Renewable contribution: (148/155) × 100 = 95.5 pts
Gas contribution:       (3/155) × 100% = 1.9 pts
Nuclear contribution:   0 pts (no nuclear)

TOTAL: 95.5 + 1.9 = 97.4 / 100`}
              </CodeBlock>

              <p className="text-sm text-secondary mt-4">
                Norway exports huge amounts of oil and gas to Europe,
                but uses almost none domestically for electricity. They&apos;re energy independent AND energy secure.
              </p>
            </div>

            {/* Example 4: Japan */}
            <div className="card p-5 mb-6">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl">🇯🇵</span>
                <div>
                  <h4 className="font-semibold text-primary">Japan (2023)</h4>
                  <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: '#EF4444', color: 'white' }}>
                    Score: 25.5 - Critical Dependency
                  </span>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4 text-xs mb-4">
                <div>
                  <h5 className="font-medium text-primary mb-2">Electricity Mix</h5>
                  <ul className="space-y-1 text-secondary">
                    <li>Total: 950 TWh</li>
                    <li>Renewables: 240 TWh (25.3%)</li>
                    <li>Nuclear: 48 TWh (5.1%)</li>
                    <li>Coal: 280 TWh (29.5%)</li>
                    <li>Gas: 360 TWh (37.9%)</li>
                  </ul>
                </div>
                <div>
                  <h5 className="font-medium text-primary mb-2">Independence Ratios</h5>
                  <ul className="space-y-1 text-secondary text-negative">
                    <li>Coal: 0%</li>
                    <li>Gas: 0.5%</li>
                    <li>Oil: 0.1%</li>
                    <li>Uranium: 0%</li>
                  </ul>
                </div>
              </div>

              <p className="text-sm text-secondary">
                Japan is one of the world&apos;s most energy-dependent major economies.
                This drives their LNG import infrastructure (world&apos;s largest LNG importer), energy efficiency focus,
                and interest in hydrogen as an alternative.
              </p>
            </div>

            {/* Example 5: Kazakhstan */}
            <div className="card p-5">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl">🇰🇿</span>
                <div>
                  <h4 className="font-semibold text-primary">Kazakhstan (2023)</h4>
                  <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: '#059669', color: 'white' }}>
                    Score: 100 - Energy Fortress
                  </span>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4 text-xs mb-4">
                <div>
                  <h5 className="font-medium text-primary mb-2">Electricity Mix</h5>
                  <ul className="space-y-1 text-secondary">
                    <li>Total: 115 TWh</li>
                    <li>Coal: 72 TWh (62.6%)</li>
                    <li>Gas: 25 TWh (21.7%)</li>
                    <li>Hydro: 12 TWh (10.4%)</li>
                  </ul>
                </div>
                <div>
                  <h5 className="font-medium text-primary mb-2">Independence Ratios</h5>
                  <ul className="space-y-1 text-secondary text-positive">
                    <li>Coal: 100% (net exporter)</li>
                    <li>Gas: 100% (net exporter)</li>
                    <li>Uranium: 100% (world&apos;s #1 producer)</li>
                  </ul>
                </div>
              </div>

              <p className="text-sm text-secondary">
                Kazakhstan is the world&apos;s largest uranium producer
                but operates zero nuclear power plants domestically. Exports uranium to France, China, USA, etc.
              </p>
            </div>
          </CollapsibleSection>

          {/* Section 6: What This Score Does NOT Measure */}
          <CollapsibleSection title="What This Score Does NOT Measure" id="not-measuring">
            <p className="text-sm text-secondary leading-relaxed mb-6">
              It&apos;s critical to understand what the Energy Independence Score is <strong className="text-primary">not</strong>:
            </p>

            <div className="space-y-4">
              <div className="card p-4 border-l-4 border-l-red-500">
                <h4 className="font-semibold text-primary mb-2">❌ NOT a measure of &quot;good&quot; vs &quot;bad&quot; energy policy</h4>
                <p className="text-sm text-secondary">
                  A country with 100% coal from domestic mines scores higher than a country with 100% imported renewables.
                  This doesn&apos;t mean coal is &quot;better&quot; - it means the coal country is more independent.
                </p>
              </div>

              <div className="card p-4 border-l-4 border-l-red-500">
                <h4 className="font-semibold text-primary mb-2">❌ NOT a measure of energy security</h4>
                <div className="overflow-x-auto mt-3">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-2 font-medium text-primary">Energy Independence</th>
                        <th className="text-left py-2 font-medium text-primary">Energy Security</th>
                      </tr>
                    </thead>
                    <tbody className="text-secondary">
                      <tr className="border-b border-border-subtle">
                        <td className="py-2">Domestic production</td>
                        <td className="py-2">Reliable supply</td>
                      </tr>
                      <tr className="border-b border-border-subtle">
                        <td className="py-2">Self-sufficiency</td>
                        <td className="py-2">Diversified sources</td>
                      </tr>
                      <tr className="border-b border-border-subtle">
                        <td className="py-2">Resource ownership</td>
                        <td className="py-2">Strategic reserves</td>
                      </tr>
                      <tr>
                        <td className="py-2">Low import ratio</td>
                        <td className="py-2">Robust infrastructure</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="card p-4 border-l-4 border-l-red-500">
                <h4 className="font-semibold text-primary mb-2">❌ NOT a measure of sustainability</h4>
                <p className="text-sm text-secondary">
                  Fossil fuel independence counts the same as renewable independence.
                  A country running on domestic coal gets the same score as one running on domestic solar.
                </p>
              </div>

              <div className="card p-4 border-l-4 border-l-red-500">
                <h4 className="font-semibold text-primary mb-2">❌ NOT a measure of electricity prices or grid reliability</h4>
                <p className="text-sm text-secondary">
                  Norway is independent AND has low prices. South Africa has domestic coal but frequent load-shedding.
                </p>
              </div>
            </div>

            <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <h4 className="font-semibold text-green-800 dark:text-green-300 mb-2">What it IS measuring</h4>
              <ul className="text-sm text-green-700 dark:text-green-400 space-y-1">
                <li>✅ Geopolitical vulnerability to supply disruptions</li>
                <li>✅ Exposure to foreign fuel price shocks</li>
                <li>✅ Dependence on international trade routes</li>
                <li>✅ Leverage other countries have over energy supply</li>
              </ul>
            </div>
          </CollapsibleSection>

          {/* Section 7: Limitations & Assumptions */}
          <CollapsibleSection title="Limitations & Assumptions" id="limitations">
            <h3 className="text-sm font-semibold text-primary mb-2">Known Limitations</h3>

            <div className="space-y-4">
              <div className="card p-4">
                <h4 className="font-semibold text-primary text-sm mb-2">1. Annual Averages Hide Seasonal Variation</h4>
                <p className="text-xs text-secondary">
                  We use annual data (2023 full year). Doesn&apos;t capture winter gas shortages or summer solar peaks.
                  Energy independence can vary month-to-month.
                </p>
              </div>

              <div className="card p-4">
                <h4 className="font-semibold text-primary text-sm mb-2">2. Sector-Agnostic Fuel Ratios</h4>
                <p className="text-xs text-secondary mb-2">
                  We assume electricity generation uses the same domestic/imported fuel mix as other sectors (heating, transport, industry).
                </p>
                <p className="text-xs text-muted">
                  No publicly available data breaks down imports by end-use sector.
                </p>
              </div>

              <div className="card p-4">
                <h4 className="font-semibold text-primary text-sm mb-2">3. Electricity Only, Not Total Energy</h4>
                <p className="text-xs text-secondary mb-2">
                  Score measures electricity independence only. Doesn&apos;t include transport fuels (gasoline, diesel) or heating fuels (natural gas, heating oil).
                  Electricity is only ~20-40% of total energy in most countries.
                </p>
                <p className="text-xs text-muted">
                  <strong>Why electricity:</strong> It&apos;s the most data-complete sector and growing due to electrification.
                </p>
              </div>

              <div className="card p-4">
                <h4 className="font-semibold text-primary text-sm mb-2">4. One-Year Lag</h4>
                <p className="text-xs text-secondary">
                  Our World in Data updates annually, usually ~1 year behind. 2023 is the latest year with complete data (as of 2025).
                </p>
              </div>

              <div className="card p-4">
                <h4 className="font-semibold text-primary text-sm mb-2">5. No Bilateral Trade Data</h4>
                <p className="text-xs text-secondary">
                  We know Germany imports gas, but not specifically from Russia vs Norway vs USA.
                  Future enhancement could add Herfindahl Index for import concentration.
                </p>
              </div>

              <div className="card p-4">
                <h4 className="font-semibold text-primary text-sm mb-2">6. Nuclear Scoring Is Controversial</h4>
                <p className="text-xs text-secondary">
                  Scoring France at 20/100 despite 70% nuclear is provocative. Some will argue enrichment/fabrication capacity should count.
                  We intentionally score conservatively to spark debate.
                </p>
              </div>

              <div className="card p-4">
                <h4 className="font-semibold text-primary text-sm mb-2">7. Renewables Hardware Imports</h4>
                <p className="text-xs text-secondary mb-2">
                  If Germany installs Chinese solar panels powered by German sunlight, is it independent?
                </p>
                <p className="text-xs text-secondary">
                  We say yes, because the energy source (sunlight) is domestic, even if the hardware is imported.
                  The marginal cost of solar is ~$0/MWh once installed.
                </p>
              </div>
            </div>
          </CollapsibleSection>

          {/* Section 8: FAQ */}
          <CollapsibleSection title="Frequently Asked Questions" id="faq">
            <div className="space-y-4">
              <div className="card p-4">
                <h4 className="font-semibold text-primary text-sm mb-2">Why does my country score so low?</h4>
                <p className="text-xs text-secondary">
                  Energy independence is hard! Most countries import significant amounts of fuel.
                  A low score reveals vulnerability but doesn&apos;t mean the country is &quot;failing&quot; -
                  it means they&apos;re exposed to supply disruptions.
                </p>
              </div>

              <div className="card p-4">
                <h4 className="font-semibold text-primary text-sm mb-2">Why does France only score 20/100 despite nuclear?</h4>
                <p className="text-xs text-secondary">
                  Because France imports 100% of its uranium fuel. Nuclear provides energy <em>security</em> (reliable baseload),
                  but not energy <em>independence</em> (domestic resources). See the France example above.
                </p>
              </div>

              <div className="card p-4">
                <h4 className="font-semibold text-primary text-sm mb-2">Isn&apos;t coal independence &quot;bad&quot; for climate?</h4>
                <p className="text-xs text-secondary">
                  The independence score is NOT a sustainability metric. A country running on domestic coal scores higher
                  than one running on imported solar panels. Use case: understanding geopolitical leverage, not carbon footprint.
                </p>
              </div>

              <div className="card p-4">
                <h4 className="font-semibold text-primary text-sm mb-2">Why count renewables as 100% independent?</h4>
                <p className="text-xs text-secondary">
                  The energy source (sun, wind, water) is free and domestic. Even if hardware is imported,
                  the marginal cost of energy production is ~$0/MWh. The sunlight/wind can&apos;t be cut off by foreign powers.
                </p>
              </div>

              <div className="card p-4">
                <h4 className="font-semibold text-primary text-sm mb-2">What about strategic reserves?</h4>
                <p className="text-xs text-secondary">
                  Not currently factored in. Future enhancement could add points for oil/gas storage capacity.
                </p>
              </div>

              <div className="card p-4">
                <h4 className="font-semibold text-primary text-sm mb-2">Do you factor in rare earth minerals for solar/wind?</h4>
                <p className="text-xs text-secondary">
                  No. We count the energy source (sunlight, wind) as domestic, even if turbine components are imported.
                  Once installed, the energy is free.
                </p>
              </div>

              <div className="card p-4">
                <h4 className="font-semibold text-primary text-sm mb-2">Can I download your data?</h4>
                <p className="text-xs text-secondary mb-2">
                  Yes! All our source data is open. Here are all the sources we use:
                </p>
                <ul className="text-xs text-secondary space-y-1">
                  <li>
                    <strong>Electricity generation:</strong>
                    <a href="https://ember-climate.org/data/" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline ml-1">Ember Climate</a>
                  </li>
                  <li>
                    <strong>Fossil fuel production:</strong>
                    <a href="https://github.com/owid/energy-data" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline ml-1">Our World in Data</a>
                  </li>
                  <li>
                    <strong>Uranium production:</strong>
                    <a href="https://world-nuclear.org/information-library/nuclear-fuel-cycle/mining-of-uranium/world-uranium-mining-production" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline ml-1">World Nuclear Association</a>,
                    <a href="https://www.eia.gov/uranium/marketing/" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline ml-1">US EIA</a>
                  </li>
                  <li>
                    <strong>Socioeconomic data:</strong>
                    <a href="https://data.worldbank.org" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline ml-1">World Bank</a>,
                    <a href="https://hdr.undp.org/data-center" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline ml-1">UNDP Human Development</a>
                  </li>
                </ul>
              </div>
            </div>
          </CollapsibleSection>

          {/* Section 9: Data Update Frequency */}
          <CollapsibleSection title="Data Update Frequency" id="updates">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 font-medium text-primary">Source</th>
                    <th className="text-left py-3 font-medium text-primary">Frequency</th>
                    <th className="text-left py-3 font-medium text-primary">Lag</th>
                  </tr>
                </thead>
                <tbody className="text-secondary">
                  <tr className="border-b border-border-subtle">
                    <td className="py-3 font-medium text-primary">Ember Climate</td>
                    <td className="py-3">Twice monthly</td>
                    <td className="py-3">2-3 months</td>
                  </tr>
                  <tr className="border-b border-border-subtle">
                    <td className="py-3 font-medium text-primary">Our World in Data</td>
                    <td className="py-3">Annually (Q3)</td>
                    <td className="py-3">~1 year</td>
                  </tr>
                  <tr className="border-b border-border-subtle">
                    <td className="py-3 font-medium text-primary">Uranium Production</td>
                    <td className="py-3">Annually</td>
                    <td className="py-3">~1 year</td>
                  </tr>
                  <tr>
                    <td className="py-3 font-medium text-primary">World Bank / UNDP</td>
                    <td className="py-3">Annually</td>
                    <td className="py-3">~1-2 years</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CollapsibleSection>

          {/* Section 10: Acknowledgments */}
          <CollapsibleSection title="Acknowledgments" id="acknowledgments">
            <h3 className="text-sm font-semibold text-primary mb-2">Data Providers</h3>
            <ul className="list-disc list-inside space-y-1 text-sm text-secondary mb-6">
              <li>Ember Climate - Open electricity generation data</li>
              <li>Our World in Data - Cleaned fossil fuel data</li>
              <li>World Nuclear Association - Uranium production statistics</li>
              <li>US Energy Information Administration - Additional nuclear data</li>
              <li>World Bank - GDP, population, and economic indicators</li>
              <li>United Nations Development Programme (UNDP) - Human Development Index</li>
              <li>Energy Institute - Historical energy statistics</li>
            </ul>

            <h3 className="text-sm font-semibold text-primary mb-2">Inspiration</h3>
            <ul className="list-disc list-inside space-y-1 text-sm text-secondary mb-6">
              <li>IEA Energy Security Dashboard - Highlighted importance of import dependency</li>
              <li>BP Statistical Review - Historical reference for energy data</li>
              <li>Hannah Ritchie & Max Roser (OWID) - Championing open energy data</li>
            </ul>

            <h3 className="text-sm font-semibold text-primary mb-2">License</h3>
            <ul className="list-disc list-inside space-y-1 text-sm text-secondary">
              <li>Source data: CC BY 4.0 (Ember, OWID)</li>
              <li>Uranium data: Publicly available from WNA/EIA</li>
            </ul>
          </CollapsibleSection>

          {/* Uranium Table Appendix */}
          <CollapsibleSection title="Appendix: Complete Uranium Production Table" id="uranium-table">
            <p className="text-sm text-secondary mb-4">
              For reference, here&apos;s the complete uranium independence lookup table used in our calculations:
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 font-medium text-primary">Category</th>
                    <th className="text-left py-2 font-medium text-primary">Countries</th>
                    <th className="text-right py-2 font-medium text-primary">Independence</th>
                  </tr>
                </thead>
                <tbody className="text-secondary">
                  <tr className="border-b border-border-subtle">
                    <td className="py-2 font-medium text-primary">Major Producers</td>
                    <td className="py-2">Kazakhstan (43%), Canada (15%), Namibia (11%), Australia (8%), Uzbekistan (7%), Niger (4%), Russia (5%)</td>
                    <td className="py-2 text-right text-positive font-medium">100%</td>
                  </tr>
                  <tr className="border-b border-border-subtle">
                    <td className="py-2 font-medium text-primary">Partial Producers</td>
                    <td className="py-2">China, Ukraine</td>
                    <td className="py-2 text-right font-medium">50%</td>
                  </tr>
                  <tr className="border-b border-border-subtle">
                    <td className="py-2 font-medium text-primary">Partial Producers</td>
                    <td className="py-2">India</td>
                    <td className="py-2 text-right font-medium">30%</td>
                  </tr>
                  <tr className="border-b border-border-subtle">
                    <td className="py-2 font-medium text-primary">Minor Producers</td>
                    <td className="py-2">South Africa, Brazil, Czech Republic, Pakistan</td>
                    <td className="py-2 text-right font-medium">5%</td>
                  </tr>
                  <tr className="border-b border-border-subtle">
                    <td className="py-2 font-medium text-primary">Minor Producers</td>
                    <td className="py-2">USA</td>
                    <td className="py-2 text-right font-medium">1%</td>
                  </tr>
                  <tr>
                    <td className="py-2 font-medium text-primary">Everyone Else</td>
                    <td className="py-2">France, Germany, Japan, UK, South Korea, Spain, Belgium, Sweden, Finland, Switzerland, etc.</td>
                    <td className="py-2 text-right text-negative font-medium">0%</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <p className="text-xs text-muted mt-4">
              Total world production: ~49,000 MT/year. Top 10 producers account for ~99% of world production.
            </p>
          </CollapsibleSection>
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
        </div>
      </main>

      <Footer />
    </div>
  );
}
