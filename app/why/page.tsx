'use client';

import { useState } from 'react';
import Link from 'next/link';
import DarkModeToggle from '@/components/DarkModeToggle';
import Navigation from '@/components/Navigation';
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
        className="w-full py-5 flex items-center justify-between text-left hover:bg-inset transition-colors rounded-lg px-3 -mx-3"
        aria-expanded={isOpen}
      >
        <h2 className="text-xl font-semibold text-primary">{title}</h2>
        <svg
          className={`w-5 h-5 text-muted transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {isOpen && (
        <div className="pb-8 space-y-6">
          {children}
        </div>
      )}
    </section>
  );
}

function InfoCard({ title, children, variant = 'default' }: { title?: string; children: React.ReactNode; variant?: 'default' | 'warning' | 'success' | 'danger' }) {
  const borderColors = {
    default: 'border-l-blue-500',
    warning: 'border-l-yellow-500',
    success: 'border-l-green-500',
    danger: 'border-l-red-500',
  };

  return (
    <div className={`card p-5 border-l-4 ${borderColors[variant]}`}>
      {title && <h4 className="text-sm font-semibold text-primary mb-2">{title}</h4>}
      <div className="text-sm text-secondary leading-relaxed">{children}</div>
    </div>
  );
}

function QuoteBlock({ children, attribution }: { children: React.ReactNode; attribution?: string }) {
  return (
    <blockquote className="border-l-4 border-primary pl-6 py-2 my-6">
      <p className="text-lg text-secondary italic leading-relaxed">{children}</p>
      {attribution && <cite className="text-sm text-muted mt-2 block not-italic">— {attribution}</cite>}
    </blockquote>
  );
}

function DataPoint({ value, label, sublabel }: { value: string; label: string; sublabel?: string }) {
  return (
    <div className="text-center">
      <div className="text-2xl font-bold text-primary">{value}</div>
      <div className="text-sm text-secondary">{label}</div>
      {sublabel && <div className="text-xs text-muted">{sublabel}</div>}
    </div>
  );
}

function ComparisonRow({ left, right, label }: { left: string; right: string; label: string }) {
  return (
    <div className="flex items-center gap-4 py-2 border-b border-border-subtle last:border-b-0">
      <div className="w-24 text-right text-sm font-medium text-primary">{left}</div>
      <div className="flex-1 text-center text-xs text-muted">{label}</div>
      <div className="w-24 text-left text-sm font-medium text-primary">{right}</div>
    </div>
  );
}

export default function WhyEnergyMattersPage() {
  return (
    <div className="min-h-screen bg-canvas flex flex-col">
      <header className="border-b border-border bg-card">
        <div className="max-w-[1800px] mx-auto px-4 py-3 flex items-center">
          <div className="flex-1">
            <Link href="/" className="text-base font-medium text-primary tracking-tight hover:text-secondary transition-colors">
              Hyperion
            </Link>
          </div>
          <Navigation currentPage="why" />
          <div className="flex-1 flex justify-end">
            <DarkModeToggle />
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-4xl mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-primary mb-4">Why Energy Matters</h1>
          <p className="text-xl text-secondary leading-relaxed mb-6">
            How electricity abundance shapes prosperity, security, and the future we&apos;re building for our children
          </p>
          <QuoteBlock>
            Every time you flip a light switch, charge your phone, or ride in an elevator, you&apos;re tapping into the foundation of modern civilization. But most of us never think about where that power comes from—until it&apos;s not there.
          </QuoteBlock>
          <div className="flex items-center gap-4 text-sm text-muted">
            <span>30-40 min read</span>
            <span>•</span>
            <span>Last updated: February 2026</span>
          </div>
        </div>

        {/* Quick Navigation */}
        <nav className="card p-5 mb-10">
          <h3 className="text-sm font-semibold text-primary mb-4">Quick Navigation</h3>
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

        <div className="space-y-0">
          {/* Section 1: Energy IS the Economy */}
          <CollapsibleSection title="1. Energy IS the Economy" id="economy" defaultOpen={true}>
            <h3 className="text-lg font-semibold text-primary mb-3">The Fundamental Truth</h3>
            <p className="text-secondary leading-relaxed mb-4">
              Energy isn&apos;t just part of the economy—it <strong className="text-primary">is</strong> the economy. Everything we produce, every service we consume, every comfort we enjoy requires energy.
            </p>

            <h3 className="text-lg font-semibold text-primary mb-3 mt-8">The Connection (Data-Driven)</h3>
            <p className="text-secondary leading-relaxed mb-4">
              The relationship between energy consumption and prosperity isn&apos;t theoretical—it&apos;s observable in data from every country on Earth:
            </p>

            <div className="card p-6 mb-6">
              <h4 className="text-sm font-semibold text-primary mb-4">GDP per Capita vs. Electricity Consumption</h4>
              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <div className="text-xs text-muted uppercase tracking-wider mb-3">High GDP, High Electricity</div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-secondary">Norway</span><span className="text-primary font-medium">23,000 kWh/capita</span></div>
                    <div className="flex justify-between"><span className="text-secondary">USA</span><span className="text-primary font-medium">12,000 kWh/capita</span></div>
                    <div className="flex justify-between"><span className="text-secondary">Germany</span><span className="text-primary font-medium">6,500 kWh/capita</span></div>
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted uppercase tracking-wider mb-3">Middle Income, Growing</div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-secondary">China</span><span className="text-primary font-medium">6,000 kWh/capita</span></div>
                    <div className="flex justify-between"><span className="text-secondary">Poland</span><span className="text-primary font-medium">4,500 kWh/capita</span></div>
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted uppercase tracking-wider mb-3">Low Income, Low Electricity</div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-secondary">Nigeria</span><span className="text-primary font-medium">160 kWh/capita</span></div>
                    <div className="flex justify-between"><span className="text-secondary">Bangladesh</span><span className="text-primary font-medium">500 kWh/capita</span></div>
                  </div>
                </div>
              </div>
            </div>

            <InfoCard variant="default" title="The Insight">
              This isn&apos;t correlation without causation—it&apos;s causation. You can&apos;t run factories without electricity. You can&apos;t power hospitals without electricity. You can&apos;t operate data centers without electricity. Prosperity requires abundant, affordable, reliable energy.
            </InfoCard>

            <h3 className="text-lg font-semibold text-primary mb-4 mt-8">What Energy Powers (The Invisible Foundation)</h3>
            <p className="text-secondary leading-relaxed mb-4">
              Most people think of energy as &quot;keeping the lights on.&quot; But energy powers <strong className="text-primary">everything</strong>:
            </p>

            <div className="grid md:grid-cols-2 gap-4 mb-6">
              <div className="card p-5">
                <h4 className="font-semibold text-primary mb-2">Manufacturing & Industry (40%)</h4>
                <ul className="text-sm text-secondary space-y-1">
                  <li>• Steel production: 5,000 kWh/tonne</li>
                  <li>• Aluminum: 15,000 kWh/tonne</li>
                  <li>• Chip fabrication: 24/7 operation</li>
                </ul>
                <p className="text-xs text-muted mt-2">Result: Jobs, exports, competitiveness</p>
              </div>
              <div className="card p-5">
                <h4 className="font-semibold text-primary mb-2">Food System</h4>
                <ul className="text-sm text-secondary space-y-1">
                  <li>• Fertilizer production (gas-intensive)</li>
                  <li>• Farm equipment & irrigation</li>
                  <li>• Processing & cold chain</li>
                </ul>
                <p className="text-xs text-muted mt-2">Result: 8 billion people fed (vs 1B in 1800)</p>
              </div>
              <div className="card p-5">
                <h4 className="font-semibold text-primary mb-2">Healthcare</h4>
                <ul className="text-sm text-secondary space-y-1">
                  <li>• 24/7 hospital power</li>
                  <li>• Vaccine production & storage</li>
                  <li>• Medical imaging & research</li>
                </ul>
                <p className="text-xs text-muted mt-2">Result: Life expectancy doubled in a century</p>
              </div>
              <div className="card p-5">
                <h4 className="font-semibold text-primary mb-2">Clean Water</h4>
                <ul className="text-sm text-secondary space-y-1">
                  <li>• Water treatment plants</li>
                  <li>• Pumping & distribution</li>
                  <li>• Desalination (~4 kWh/m³)</li>
                </ul>
                <p className="text-xs text-muted mt-2">Result: Cholera, typhoid eliminated</p>
              </div>
              <div className="card p-5">
                <h4 className="font-semibold text-primary mb-2">Technology & Communication</h4>
                <ul className="text-sm text-secondary space-y-1">
                  <li>• Data centers (massive 24/7 load)</li>
                  <li>• Telecommunications networks</li>
                  <li>• Cloud services</li>
                </ul>
                <p className="text-xs text-muted mt-2">Result: Digital economy, remote work</p>
              </div>
              <div className="card p-5">
                <h4 className="font-semibold text-primary mb-2">Transportation (Electrifying)</h4>
                <ul className="text-sm text-secondary space-y-1">
                  <li>• EV charging infrastructure</li>
                  <li>• Electric rail systems</li>
                  <li>• Urban transit</li>
                </ul>
                <p className="text-xs text-muted mt-2">Result: Mobility, reduced local pollution</p>
              </div>
            </div>

            <h3 className="text-lg font-semibold text-primary mb-4 mt-8">The Hidden Multiplier</h3>
            <div className="card p-5 mb-6">
              <h4 className="font-semibold text-primary mb-3">Example: Aluminum Smelter</h4>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <div className="text-sm text-muted mb-2">Input</div>
                  <div className="text-lg font-medium text-primary">15,000 kWh electricity</div>
                  <div className="text-sm text-secondary">~$1,500 at $0.10/kWh</div>
                </div>
                <div>
                  <div className="text-sm text-muted mb-2">Output</div>
                  <div className="text-lg font-medium text-primary">1 tonne aluminum</div>
                  <div className="text-sm text-secondary">~$2,500 market value</div>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-border">
                <div className="text-sm text-muted mb-2">But that aluminum becomes:</div>
                <div className="flex flex-wrap gap-3">
                  <span className="px-3 py-1 bg-inset rounded-full text-sm text-secondary">Aircraft parts ($50,000+)</span>
                  <span className="px-3 py-1 bg-inset rounded-full text-sm text-secondary">Medical devices ($100,000+)</span>
                  <span className="px-3 py-1 bg-inset rounded-full text-sm text-secondary">Electronics ($20,000+)</span>
                </div>
                <p className="text-sm text-primary font-medium mt-3">Energy multiplier: 1 kWh → $10-100 of economic value</p>
              </div>
            </div>

            <h3 className="text-lg font-semibold text-primary mb-4 mt-8">The Harsh Reality</h3>
            <InfoCard variant="danger" title="Countries with unreliable electricity cannot compete economically.">
              <p className="mb-4">
                <strong>South Africa (2023):</strong> 300+ days of load-shedding. GDP growth: 0.7%. Unemployment: 33%. Manufacturing declining for a decade. Foreign investment fleeing.
              </p>
              <p>
                <strong>Pakistan (2023):</strong> Textile factories forced to close during blackouts. Lost orders to Bangladesh and Vietnam. Billions in export revenue lost. Hundreds of thousands of jobs.
              </p>
            </InfoCard>
            <p className="text-secondary leading-relaxed mt-4">
              <strong className="text-primary">The Lesson:</strong> Energy isn&apos;t just infrastructure—it&apos;s economic survival.
            </p>
          </CollapsibleSection>

          {/* Section 2: The Price of Energy */}
          <CollapsibleSection title="2. The Price of Energy IS the Price of Everything" id="price">
            <h3 className="text-lg font-semibold text-primary mb-3">Understanding the Ripple Effect</h3>
            <p className="text-secondary leading-relaxed mb-6">
              When energy prices rise, everything costs more. This isn&apos;t abstract economics—it&apos;s your grocery bill, your rent, your job security.
            </p>

            <h3 className="text-lg font-semibold text-primary mb-4">The 2022 European Energy Crisis</h3>
            <div className="card p-5 mb-6">
              <h4 className="font-semibold text-primary mb-3">What Happened</h4>
              <ul className="text-secondary space-y-2 mb-4">
                <li>• Russia reduced natural gas exports to Europe</li>
                <li>• European gas prices: €20/MWh → €200/MWh <strong className="text-primary">(10x increase)</strong></li>
                <li>• Electricity prices followed gas prices up</li>
              </ul>
            </div>

            <h4 className="font-semibold text-primary mb-3">The Cascading Impact</h4>

            <div className="space-y-4 mb-6">
              <div className="card p-5">
                <h5 className="font-semibold text-primary mb-2">1. Household Electricity Bills</h5>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-4 bg-inset rounded-lg">
                    <div className="text-xs text-muted uppercase tracking-wider mb-1">Before Crisis</div>
                    <div className="text-xl font-bold text-primary">€100/month</div>
                    <div className="text-sm text-secondary">Average German household</div>
                  </div>
                  <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    <div className="text-xs text-red-600 dark:text-red-400 uppercase tracking-wider mb-1">Crisis Peak</div>
                    <div className="text-xl font-bold text-red-600 dark:text-red-400">€300-500/month</div>
                    <div className="text-sm text-red-700 dark:text-red-300">Energy poverty, heat vs food decisions</div>
                  </div>
                </div>
              </div>

              <div className="card p-5">
                <h5 className="font-semibold text-primary mb-3">2. Industrial Shutdown</h5>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <span className="text-lg">⚠️</span>
                    <div>
                      <div className="font-medium text-primary">Fertilizer plants: Shut down</div>
                      <div className="text-sm text-secondary">Gas is both feedstock and energy. Result: Fertilizer prices doubled globally → Higher food costs worldwide</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-lg">⚠️</span>
                    <div>
                      <div className="font-medium text-primary">Chemical plants: Production curtailed</div>
                      <div className="text-sm text-secondary">BASF and others cut output. Supply chain disruptions across industries</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-lg">⚠️</span>
                    <div>
                      <div className="font-medium text-primary">Aluminum smelters: Permanent closures</div>
                      <div className="text-sm text-secondary">European aluminum industry hollowed out. Jobs lost permanently.</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="card p-5">
                <h5 className="font-semibold text-primary mb-3">3. The Food Price Chain Reaction</h5>
                <div className="flex flex-wrap items-center gap-2 text-sm">
                  <span className="px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-full">High gas prices</span>
                  <span className="text-muted">→</span>
                  <span className="px-3 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 rounded-full">Expensive fertilizer</span>
                  <span className="text-muted">→</span>
                  <span className="px-3 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 rounded-full">Higher farm costs</span>
                  <span className="text-muted">→</span>
                  <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full">Food prices up 15-20%</span>
                  <span className="text-muted">→</span>
                  <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full">Cost of living crisis</span>
                </div>
                <p className="text-sm text-muted mt-3">UK food bank usage: +30%</p>
              </div>

              <div className="card p-5">
                <h5 className="font-semibold text-primary mb-3">4. Business Competitiveness</h5>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-2 text-primary font-medium">Region</th>
                        <th className="text-right py-2 text-primary font-medium">Electricity Price</th>
                        <th className="text-right py-2 text-primary font-medium">Competitive?</th>
                      </tr>
                    </thead>
                    <tbody className="text-secondary">
                      <tr className="border-b border-border-subtle">
                        <td className="py-2">European factory</td>
                        <td className="py-2 text-right font-medium text-red-600 dark:text-red-400">€200/MWh</td>
                        <td className="py-2 text-right">❌</td>
                      </tr>
                      <tr className="border-b border-border-subtle">
                        <td className="py-2">US factory</td>
                        <td className="py-2 text-right font-medium">€100/MWh</td>
                        <td className="py-2 text-right">⚠️</td>
                      </tr>
                      <tr>
                        <td className="py-2">Chinese factory</td>
                        <td className="py-2 text-right font-medium text-green-600 dark:text-green-400">€70/MWh</td>
                        <td className="py-2 text-right">✅</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <p className="text-sm text-secondary mt-3">Result: Production moves to Asia/US. Permanent job losses in Europe.</p>
              </div>
            </div>

            <h3 className="text-lg font-semibold text-primary mb-4 mt-8">Why This Matters to Regular People</h3>
            <div className="grid md:grid-cols-2 gap-4 mb-6">
              <div className="card p-4">
                <div className="text-xs text-muted uppercase tracking-wider mb-2">The Abstract Version</div>
                <p className="text-sm text-secondary italic">&quot;Energy policy affects macroeconomic competitiveness.&quot;</p>
              </div>
              <div className="card p-4 border-l-4 border-l-red-500">
                <div className="text-xs text-red-600 dark:text-red-400 uppercase tracking-wider mb-2">The Reality</div>
                <ul className="text-sm text-primary space-y-1">
                  <li>• Your electricity bill tripled</li>
                  <li>• Your grocery costs up 20%</li>
                  <li>• Your company closed the local factory</li>
                  <li>• Your neighbor lost their job</li>
                </ul>
              </div>
            </div>

            <InfoCard variant="warning" title="This is why energy policy isn't just for experts—it affects everyone.">
              High energy costs don&apos;t just hurt in the moment. They cause <strong>permanent economic scarring</strong>: factories close and don&apos;t come back, investment goes elsewhere, engineers move to countries with better jobs, and competitive disadvantage becomes structural.
            </InfoCard>

            <div className="card p-5 mt-6">
              <h4 className="font-semibold text-primary mb-3">Case Study: German Chemical Industry</h4>
              <ul className="text-sm text-secondary space-y-2">
                <li><strong className="text-primary">Pre-crisis:</strong> World leader, massive exports</li>
                <li><strong className="text-primary">Post-crisis:</strong> Permanent production cuts, moving to USA/China</li>
                <li><strong className="text-primary">BASF CEO (2023):</strong> &quot;We will not invest further in Europe with these energy prices&quot;</li>
              </ul>
              <p className="text-sm text-primary font-medium mt-3">Germany&apos;s industrial crown jewel at risk.</p>
            </div>

            <InfoCard variant="default" title="The Intergenerational Impact" >
              Your children will inherit an economy shaped by today&apos;s energy decisions. If heavy industry leaves, those jobs don&apos;t come back for a generation.
            </InfoCard>
          </CollapsibleSection>

          {/* Section 3: Energy Security IS National Security */}
          <CollapsibleSection title="3. Energy Security IS National Security" id="security">
            <h3 className="text-lg font-semibold text-primary mb-3">The Geopolitical Reality</h3>
            <p className="text-secondary leading-relaxed mb-6">
              Energy dependence gives other countries leverage over you. This isn&apos;t paranoid—it&apos;s just how power works.
            </p>

            <h3 className="text-lg font-semibold text-primary mb-4">Historical Examples</h3>

            <div className="card p-5 mb-4">
              <h4 className="font-semibold text-primary mb-3">1. The 1970s Oil Embargos</h4>
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div>
                  <div className="text-sm text-muted mb-2">What Happened</div>
                  <ul className="text-sm text-secondary space-y-1">
                    <li>• 1973: OPEC oil embargo against Western nations</li>
                    <li>• Oil price: $3/barrel → $12/barrel (4x)</li>
                    <li>• Gas lines in USA, rationing in Europe</li>
                  </ul>
                </div>
                <div>
                  <div className="text-sm text-muted mb-2">The Impact</div>
                  <ul className="text-sm text-secondary space-y-1">
                    <li>• Economic recession in USA, Europe</li>
                    <li>• Inflation + unemployment (&quot;stagflation&quot;)</li>
                    <li>• Global power dynamics shifted overnight</li>
                  </ul>
                </div>
              </div>
              <p className="text-sm text-primary font-medium">
                Lesson: Whoever controls your energy can control your economy.
              </p>
            </div>

            <div className="card p-5 mb-4">
              <h4 className="font-semibold text-primary mb-3">2. Russia-Europe Gas Relationship (2000-2022)</h4>
              <div className="mb-4">
                <div className="text-sm text-muted mb-2">The Setup</div>
                <ul className="text-sm text-secondary space-y-1">
                  <li>• Europe (especially Germany) became heavily dependent on Russian gas</li>
                  <li>• Germany: ~55% of gas from Russia by 2021</li>
                  <li>• Justified as &quot;economic interdependence promotes peace&quot;</li>
                </ul>
              </div>
              <div className="mb-4">
                <div className="text-sm text-muted mb-2">The Reality</div>
                <ul className="text-sm text-secondary space-y-1">
                  <li>• <strong>2006:</strong> Cut gas to Ukraine during pricing dispute</li>
                  <li>• <strong>2009:</strong> Cut gas to Ukraine again (Europe freezing)</li>
                  <li>• <strong>2014:</strong> After Crimea, threatened further cuts</li>
                  <li>• <strong>2022:</strong> After Ukraine invasion, weaponized gas completely</li>
                </ul>
              </div>
              <InfoCard variant="warning">
                &quot;Economic interdependence&quot; with an adversary is just dependency. Germany&apos;s former Chancellor Schröder went to work for Gazprom. The policy was compromised from the start.
              </InfoCard>
            </div>

            <h3 className="text-lg font-semibold text-primary mb-4 mt-8">The Leverage Mechanism</h3>
            <div className="card p-5 mb-6">
              <div className="flex flex-wrap items-center gap-2 text-sm mb-4">
                <span className="px-3 py-1 bg-inset rounded-full">Country A depends on B for energy</span>
                <span className="text-muted">→</span>
                <span className="px-3 py-1 bg-inset rounded-full">B threatens to cut supplies</span>
                <span className="text-muted">→</span>
                <span className="px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-full">A&apos;s sovereignty compromised</span>
              </div>
              <p className="text-sm text-primary font-medium">This isn&apos;t theory—it&apos;s happened repeatedly throughout history.</p>
            </div>

            <h3 className="text-lg font-semibold text-primary mb-4">Modern Examples of Energy Leverage</h3>
            <div className="space-y-4 mb-6">
              <div className="card p-5">
                <h5 className="font-semibold text-primary mb-2">China&apos;s Rare Earth Control</h5>
                <p className="text-sm text-secondary mb-2">
                  China controls 70% of global rare earth production. These are critical for wind turbines, EVs, electronics.
                </p>
                <p className="text-sm text-secondary">
                  <strong className="text-primary">2010:</strong> China restricted exports during Japan dispute. Japan backed down politically.
                </p>
              </div>
              <div className="card p-5">
                <h5 className="font-semibold text-primary mb-2">Japan WWII - The Ultimate Example</h5>
                <p className="text-sm text-secondary">
                  Japan had no domestic oil. The US oil embargo (1941) crippled the Japanese military. Japan attacked Pearl Harbor partly to secure oil in Southeast Asia.
                </p>
                <p className="text-sm text-primary font-medium mt-2">Lesson: Energy dependence can lead to war.</p>
              </div>
            </div>

            <h3 className="text-lg font-semibold text-primary mb-4 mt-8">The Uncomfortable Truth</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="card p-5">
                <h5 className="font-semibold text-primary mb-3">Energy independence guarantees:</h5>
                <ul className="text-sm text-secondary space-y-2">
                  <li className="flex items-center gap-2"><span className="text-green-500">✓</span> No foreign country can cut your supply</li>
                  <li className="flex items-center gap-2"><span className="text-green-500">✓</span> Political decisions remain yours</li>
                  <li className="flex items-center gap-2"><span className="text-green-500">✓</span> Economic resilience during crises</li>
                  <li className="flex items-center gap-2"><span className="text-green-500">✓</span> Strategic autonomy in foreign policy</li>
                </ul>
              </div>
              <div className="card p-5 border-l-4 border-l-red-500">
                <h5 className="font-semibold text-primary mb-3">Energy dependence means:</h5>
                <ul className="text-sm text-secondary space-y-2">
                  <li className="flex items-center gap-2"><span className="text-red-500">✗</span> Suppliers can threaten cutoffs</li>
                  <li className="flex items-center gap-2"><span className="text-red-500">✗</span> Economy hostage to others&apos; decisions</li>
                  <li className="flex items-center gap-2"><span className="text-red-500">✗</span> Foreign policy constrained</li>
                  <li className="flex items-center gap-2"><span className="text-red-500">✗</span> National security compromised</li>
                </ul>
              </div>
            </div>
          </CollapsibleSection>

          {/* Section 4: Policy Decisions That Shape Our Future */}
          <CollapsibleSection title="4. The Policy Decisions That Shape Our Future" id="policy">
            <h3 className="text-lg font-semibold text-primary mb-3">Why Energy Policy Matters (More Than You Think)</h3>
            <p className="text-secondary leading-relaxed mb-6">
              Most people don&apos;t think about energy policy until their electricity bill spikes. But energy decisions made today will shape your children&apos;s job prospects, your country&apos;s economic competitiveness, your national security posture, and your household budget for decades.
            </p>
            <p className="text-primary font-medium mb-6">These aren&apos;t &quot;future problems&quot;—they&apos;re happening now.</p>

            <h3 className="text-lg font-semibold text-primary mb-4">Case Study: Germany&apos;s Energiewende (2011-2024)</h3>
            <div className="card p-5 mb-6">
              <h4 className="font-semibold text-primary mb-3">The Decision (2011)</h4>
              <p className="text-sm text-secondary mb-4">
                After Fukushima, Germany decided to shut down all nuclear plants by 2022, replace with renewables, and achieve climate leadership.
              </p>

              <div className="grid md:grid-cols-2 gap-6 mb-4">
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <h5 className="font-medium text-green-700 dark:text-green-400 mb-2">Successes</h5>
                  <ul className="text-sm text-green-600 dark:text-green-300 space-y-1">
                    <li>✓ Renewable electricity: 20% → 52%</li>
                    <li>✓ Massive wind + solar build-out</li>
                    <li>✓ Proved renewables can scale</li>
                  </ul>
                </div>
                <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <h5 className="font-medium text-red-700 dark:text-red-400 mb-2">Failures</h5>
                  <ul className="text-sm text-red-600 dark:text-red-300 space-y-1">
                    <li>✗ Gas dependency increased (35% → 55%)</li>
                    <li>✗ Electricity prices: 3x USA prices</li>
                    <li>✗ When Russia cut gas: economic crisis</li>
                    <li>✗ Coal use increased to replace nuclear</li>
                  </ul>
                </div>
              </div>

              <InfoCard variant="warning" title="What Went Wrong">
                Nuclear was shut down before alternatives were ready. Intermittent renewables required gas backup. Gas dependence created geopolitical vulnerability. High costs hurt industrial competitiveness. Climate goals compromised.
              </InfoCard>

              <p className="text-sm text-primary font-medium mt-4">
                The Lesson: Good intentions ≠ good outcomes. Energy policy is complex.
              </p>
            </div>

            <h3 className="text-lg font-semibold text-primary mb-4">Case Study: France&apos;s Nuclear Bet (1970s-Present)</h3>
            <div className="card p-5 mb-6">
              <h4 className="font-semibold text-primary mb-3">The Decision (1970s)</h4>
              <p className="text-sm text-secondary mb-4">
                After 1973 oil crisis, France went all-in on nuclear power. Built 50+ reactors in 25 years.
              </p>

              <div className="grid md:grid-cols-2 gap-6 mb-4">
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <h5 className="font-medium text-green-700 dark:text-green-400 mb-2">Successes</h5>
                  <ul className="text-sm text-green-600 dark:text-green-300 space-y-1">
                    <li>✓ Nuclear: 70% of electricity</li>
                    <li>✓ Prices: Among lowest in Europe</li>
                    <li>✓ CO₂: 50g/kWh vs Germany 350g</li>
                    <li>✓ Industrial competitiveness: Strong</li>
                  </ul>
                </div>
                <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                  <h5 className="font-medium text-yellow-700 dark:text-yellow-400 mb-2">Challenges</h5>
                  <ul className="text-sm text-yellow-600 dark:text-yellow-300 space-y-1">
                    <li>⚠ Uranium imports: 100%</li>
                    <li>⚠ Aging fleet: Maintenance issues</li>
                    <li>⚠ New builds: Expensive, delayed</li>
                    <li>⚠ Waste: Long-term storage</li>
                  </ul>
                </div>
              </div>

              <p className="text-sm text-primary font-medium">
                The Lesson: Strategic energy decisions have 50-year consequences. France made a bet in the 1970s that still defines their economy today—mostly positively.
              </p>
            </div>

            <h3 className="text-lg font-semibold text-primary mb-4">The Common Pattern</h3>
            <InfoCard variant="default" title="Energy Policy Decisions Have Long Time Horizons">
              <ul className="space-y-1 mt-2">
                <li>• Nuclear plants: 60+ year lifespan</li>
                <li>• Gas pipelines: 40+ year lifespan</li>
                <li>• Renewable infrastructure: 20-30 years</li>
                <li>• Fuel dependency: Can&apos;t easily reverse</li>
              </ul>
              <p className="font-medium mt-3">Once you make a choice, you live with it for decades.</p>
            </InfoCard>

            <div className="card p-5 mt-6">
              <h4 className="font-semibold text-primary mb-3">The Trade-offs Every Country Faces</h4>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-secondary">Low costs today</span>
                  <span className="text-muted">vs</span>
                  <span className="text-secondary">Resilience for tomorrow</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-secondary">Accept dependency</span>
                  <span className="text-muted">vs</span>
                  <span className="text-secondary">Pay for independence</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-secondary">Economic efficiency</span>
                  <span className="text-muted">vs</span>
                  <span className="text-secondary">Strategic autonomy</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-secondary">Bet on one technology</span>
                  <span className="text-muted">vs</span>
                  <span className="text-secondary">Diversify</span>
                </div>
              </div>
              <p className="text-sm text-primary font-medium mt-4">There are no perfect answers—only trade-offs.</p>
            </div>
          </CollapsibleSection>

          {/* Section 5: Current Decisions */}
          <CollapsibleSection title="5. The Decisions Being Made Right Now" id="current">
            <h3 className="text-lg font-semibold text-primary mb-3">Why This Moment Matters</h3>
            <p className="text-secondary leading-relaxed mb-4">
              The 2020s are a critical decade for energy policy worldwide. Climate commitments are accelerating energy transition. Geopolitical tensions are reshaping energy trade. Technology costs are changing what&apos;s possible.
            </p>
            <p className="text-primary font-medium mb-6">
              Decisions made now will define 2050-2070. Your elected officials are making these decisions right now. Are they making them wisely?
            </p>

            <h3 className="text-lg font-semibold text-primary mb-4">Current Global Trends</h3>

            <div className="space-y-4 mb-6">
              <div className="card p-5">
                <h5 className="font-semibold text-primary mb-3">1. The Renewable Energy Transition</h5>
                <p className="text-sm text-secondary mb-3">Solar & wind costs have fallen 90% in a decade. Many countries committing to &quot;net zero&quot; by 2050.</p>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs text-muted uppercase tracking-wider mb-2">The Challenges</div>
                    <ul className="text-sm text-secondary space-y-1">
                      <li>• Intermittency: Sun/wind aren&apos;t constant</li>
                      <li>• Grid stability: Requires backup/storage</li>
                      <li>• Manufacturing: Most panels made in China</li>
                      <li>• Materials: Massive copper, lithium, rare earths</li>
                    </ul>
                  </div>
                  <div>
                    <div className="text-xs text-muted uppercase tracking-wider mb-2">Key Questions</div>
                    <ul className="text-sm text-secondary space-y-1">
                      <li>• What backs up renewables?</li>
                      <li>• Who controls supply chains?</li>
                      <li>• Can grids handle it?</li>
                      <li>• Can we build fast enough?</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="card p-5">
                <h5 className="font-semibold text-primary mb-3">2. Nuclear Revival (or Not?)</h5>
                <p className="text-sm text-secondary mb-3">Some countries reconsidering nuclear (France, UK, Poland). Others doubling down on phase-out (Germany, Belgium). New SMR technologies in development.</p>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs text-muted uppercase tracking-wider mb-2">The Debates</div>
                    <ul className="text-sm text-secondary space-y-1">
                      <li>• Safety: Modern designs vs. Chernobyl fear</li>
                      <li>• Waste: Long-term storage question</li>
                      <li>• Cost: New builds expensive</li>
                      <li>• Time: Takes 10+ years to build</li>
                    </ul>
                  </div>
                  <div>
                    <div className="text-xs text-muted uppercase tracking-wider mb-2">Key Questions</div>
                    <ul className="text-sm text-secondary space-y-1">
                      <li>• Extend existing plants or close early?</li>
                      <li>• Build new plants? Where?</li>
                      <li>• Who pays?</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="card p-5">
                <h5 className="font-semibold text-primary mb-3">3. Electrification of Everything</h5>
                <p className="text-sm text-secondary mb-3">
                  EVs replacing ICE cars. Heat pumps replacing gas boilers. Electric furnaces, green hydrogen for industry. Result: Electricity demand could <strong className="text-primary">double by 2050</strong>.
                </p>
                <InfoCard variant="warning">
                  Need to build generation capacity AND grid infrastructure. All while transitioning away from fossil fuels. All while maintaining reliability. All while keeping costs reasonable.
                </InfoCard>
              </div>
            </div>

            <h3 className="text-lg font-semibold text-primary mb-4 mt-8">The Policy Choices Being Made Now</h3>
            <div className="card p-5">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h5 className="font-medium text-primary mb-2">Energy Mix</h5>
                  <ul className="text-sm text-secondary space-y-1">
                    <li>• Close coal plants? When?</li>
                    <li>• Keep nuclear or phase out?</li>
                    <li>• How much renewable? How fast?</li>
                    <li>• What provides backup?</li>
                  </ul>
                </div>
                <div>
                  <h5 className="font-medium text-primary mb-2">Dependencies</h5>
                  <ul className="text-sm text-secondary space-y-1">
                    <li>• Accept gas imports? From whom?</li>
                    <li>• Import solar panels from China?</li>
                    <li>• Buy uranium from Kazakhstan?</li>
                    <li>• Rely on undersea cables?</li>
                  </ul>
                </div>
                <div>
                  <h5 className="font-medium text-primary mb-2">Infrastructure</h5>
                  <ul className="text-sm text-secondary space-y-1">
                    <li>• Build new power plants? What kind?</li>
                    <li>• Upgrade transmission grids?</li>
                    <li>• LNG import terminals?</li>
                    <li>• Hydrogen pipelines?</li>
                  </ul>
                </div>
                <div>
                  <h5 className="font-medium text-primary mb-2">Costs</h5>
                  <ul className="text-sm text-secondary space-y-1">
                    <li>• Who pays for transition?</li>
                    <li>• Who pays for grid upgrades?</li>
                    <li>• How to protect vulnerable households?</li>
                    <li>• How to keep industry competitive?</li>
                  </ul>
                </div>
              </div>
              <p className="text-sm text-primary font-medium mt-6">
                These decisions will shape your electricity bills, your country&apos;s industrial base, your children&apos;s job opportunities, and your national security posture—for decades.
              </p>
            </div>
          </CollapsibleSection>

          {/* Section 6: What You Can Do */}
          <CollapsibleSection title="6. What You Can Do" id="action">
            <h3 className="text-lg font-semibold text-primary mb-4">Understanding Energy Policy</h3>

            <div className="card p-5 mb-6">
              <h4 className="font-semibold text-primary mb-3">Step 1: Follow the Numbers</h4>
              <p className="text-sm text-secondary mb-4">When politicians talk about energy, ask:</p>
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <ul className="text-sm text-secondary space-y-2">
                  <li className="flex items-start gap-2"><span className="text-green-500 mt-1">✓</span> What&apos;s the total cost? (Not just generation)</li>
                  <li className="flex items-start gap-2"><span className="text-green-500 mt-1">✓</span> Where does reliability come from?</li>
                  <li className="flex items-start gap-2"><span className="text-green-500 mt-1">✓</span> What are the dependencies?</li>
                </ul>
                <ul className="text-sm text-secondary space-y-2">
                  <li className="flex items-start gap-2"><span className="text-green-500 mt-1">✓</span> What&apos;s the timeline?</li>
                  <li className="flex items-start gap-2"><span className="text-green-500 mt-1">✓</span> Who bears the costs?</li>
                </ul>
              </div>

              <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <h5 className="font-medium text-red-700 dark:text-red-400 mb-2">Red Flags</h5>
                <ul className="text-sm text-red-600 dark:text-red-300 space-y-1">
                  <li>• Promises with no cost estimates</li>
                  <li>• &quot;Just build more renewables&quot; with no backup plan</li>
                  <li>• Closing reliable plants with no replacement ready</li>
                  <li>• &quot;Energy independence&quot; but increasing imports</li>
                </ul>
              </div>
            </div>

            <div className="card p-5 mb-6">
              <h4 className="font-semibold text-primary mb-3">Step 2: Understand Trade-offs</h4>
              <p className="text-sm text-secondary mb-4">There are no perfect energy solutions. Every choice has trade-offs:</p>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2 font-medium text-primary">Source</th>
                      <th className="text-left py-2 font-medium text-primary">Pros</th>
                      <th className="text-left py-2 font-medium text-primary">Cons</th>
                    </tr>
                  </thead>
                  <tbody className="text-secondary">
                    <tr className="border-b border-border-subtle">
                      <td className="py-2 font-medium text-primary">Coal</td>
                      <td className="py-2">Cheap, reliable, abundant</td>
                      <td className="py-2">CO₂, air pollution</td>
                    </tr>
                    <tr className="border-b border-border-subtle">
                      <td className="py-2 font-medium text-primary">Gas</td>
                      <td className="py-2">Cleaner than coal, flexible</td>
                      <td className="py-2">CO₂, import dependency</td>
                    </tr>
                    <tr className="border-b border-border-subtle">
                      <td className="py-2 font-medium text-primary">Nuclear</td>
                      <td className="py-2">Low carbon, reliable, dense</td>
                      <td className="py-2">Waste, upfront cost, public fear</td>
                    </tr>
                    <tr className="border-b border-border-subtle">
                      <td className="py-2 font-medium text-primary">Solar/Wind</td>
                      <td className="py-2">Clean, falling costs</td>
                      <td className="py-2">Intermittent, land use</td>
                    </tr>
                    <tr>
                      <td className="py-2 font-medium text-primary">Hydro</td>
                      <td className="py-2">Clean, reliable, storage</td>
                      <td className="py-2">Geographic limits, ecosystem impact</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="text-sm text-primary font-medium mt-4">
                Be skeptical of anyone claiming their solution has no trade-offs.
              </p>
            </div>

            <h3 className="text-lg font-semibold text-primary mb-4 mt-8">Questions to Ask Your Representatives</h3>
            <div className="card p-5 mb-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h5 className="font-medium text-primary mb-2">Basic Questions</h5>
                  <ul className="text-sm text-secondary space-y-2">
                    <li>1. What is our energy independence score, and why?</li>
                    <li>2. What % of electricity comes from imports?</li>
                    <li>3. What happens if our main supplier cuts us off?</li>
                    <li>4. How will this affect electricity prices?</li>
                  </ul>
                </div>
                <div>
                  <h5 className="font-medium text-primary mb-2">Policy-Specific</h5>
                  <ul className="text-sm text-secondary space-y-2">
                    <li>1. If we close this plant, what replaces it? When?</li>
                    <li>2. If we buy panels from China, what&apos;s the risk?</li>
                    <li>3. How much will this cost in total, and who pays?</li>
                    <li>4. What&apos;s the plan if this doesn&apos;t work?</li>
                  </ul>
                </div>
              </div>
              <p className="text-sm text-primary font-medium mt-4">Don&apos;t accept vague answers. Demand specifics.</p>
            </div>

            <h3 className="text-lg font-semibold text-primary mb-4 mt-8">For Parents: Why This Matters for Your Children</h3>
            <InfoCard variant="default" title="The Energy Decisions Made Today Will Determine">
              <div className="grid md:grid-cols-2 gap-4 mt-3">
                <div>
                  <h5 className="font-medium text-primary mb-1">Economic Opportunity (2030-2050)</h5>
                  <p className="text-sm">Will good-paying manufacturing jobs exist in your country? Or will factories have moved to countries with cheaper energy?</p>
                </div>
                <div>
                  <h5 className="font-medium text-primary mb-1">Quality of Life</h5>
                  <p className="text-sm">Will electricity be affordable? Or will energy poverty be widespread?</p>
                </div>
                <div>
                  <h5 className="font-medium text-primary mb-1">National Security</h5>
                  <p className="text-sm">Will your country control its own energy destiny? Or be beholden to potentially hostile suppliers?</p>
                </div>
              </div>
              <p className="font-medium mt-4">Energy decisions made in the 2020s will shape the 2040s-2060s—your children&apos;s prime working years.</p>
            </InfoCard>
          </CollapsibleSection>

          {/* Section 7: The Path Forward */}
          <CollapsibleSection title="7. The Path Forward" id="forward">
            <h3 className="text-lg font-semibold text-primary mb-4">What Good Energy Policy Looks Like</h3>
            <div className="card p-5 mb-6">
              <h4 className="font-semibold text-primary mb-3">Good energy policy balances:</h4>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="text-center">
                  <div className="text-2xl mb-1">💰</div>
                  <div className="text-sm font-medium text-primary">Affordability</div>
                  <div className="text-xs text-secondary">Reasonable costs</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl mb-1">⚡</div>
                  <div className="text-sm font-medium text-primary">Reliability</div>
                  <div className="text-xs text-secondary">24/7 availability</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl mb-1">🔒</div>
                  <div className="text-sm font-medium text-primary">Security</div>
                  <div className="text-xs text-secondary">Minimize dependencies</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl mb-1">🌱</div>
                  <div className="text-sm font-medium text-primary">Sustainability</div>
                  <div className="text-xs text-secondary">Environmental concerns</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl mb-1">🎯</div>
                  <div className="text-sm font-medium text-primary">Realism</div>
                  <div className="text-xs text-secondary">Engineering reality</div>
                </div>
              </div>
              <p className="text-sm text-secondary mt-4 text-center">
                <strong className="text-primary">The Energy Trilemma:</strong> You can&apos;t maximize all at once. Trade-offs are inevitable.
              </p>
            </div>

            <h3 className="text-lg font-semibold text-primary mb-4">What Bad Energy Policy Looks Like</h3>
            <div className="card p-5 mb-6 border-l-4 border-l-red-500">
              <h4 className="font-semibold text-red-600 dark:text-red-400 mb-3">Warning Signs</h4>
              <ul className="text-sm text-secondary space-y-2">
                <li className="flex items-center gap-2"><span className="text-red-500">✗</span> Closing reliable plants before replacements are ready</li>
                <li className="flex items-center gap-2"><span className="text-red-500">✗</span> Creating new dependencies while claiming &quot;independence&quot;</li>
                <li className="flex items-center gap-2"><span className="text-red-500">✗</span> Ignoring costs or pushing them to future generations</li>
                <li className="flex items-center gap-2"><span className="text-red-500">✗</span> Ideology over engineering (both left and right)</li>
                <li className="flex items-center gap-2"><span className="text-red-500">✗</span> Short-term thinking (election cycles, not decades)</li>
                <li className="flex items-center gap-2"><span className="text-red-500">✗</span> Assuming technology miracles will save us</li>
              </ul>
            </div>

            <h3 className="text-lg font-semibold text-primary mb-4">Countries Getting It (Mostly) Right</h3>
            <div className="grid md:grid-cols-3 gap-4 mb-6">
              <div className="card p-5">
                <h5 className="font-semibold text-primary mb-2">Norway</h5>
                <p className="text-sm text-secondary mb-2">Leveraged natural hydro. 95%+ renewable electricity. Energy independence + security + affordability.</p>
                <p className="text-xs text-muted">Lesson: Use your natural advantages</p>
              </div>
              <div className="card p-5">
                <h5 className="font-semibold text-primary mb-2">France</h5>
                <p className="text-sm text-secondary mb-2">Long-term nuclear bet (1970s). Reliable, low-cost, low-carbon for 50 years.</p>
                <p className="text-xs text-muted">Lesson: Long-term thinking pays off</p>
              </div>
              <div className="card p-5">
                <h5 className="font-semibold text-primary mb-2">Poland</h5>
                <p className="text-sm text-secondary mb-2">Diversifying away from Russian gas. Building nuclear. Developing offshore wind. Maintaining coal as backup.</p>
                <p className="text-xs text-muted">Lesson: Security first, then transition</p>
              </div>
            </div>

            <h3 className="text-lg font-semibold text-primary mb-4">The Hope</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="card p-5">
                <h5 className="font-semibold text-green-600 dark:text-green-400 mb-2">Good News</h5>
                <ul className="text-sm text-secondary space-y-1">
                  <li>• Technology is improving</li>
                  <li>• Costs are falling</li>
                  <li>• Awareness is rising (2022 wake-up call)</li>
                  <li>• Solutions exist</li>
                </ul>
              </div>
              <div className="card p-5">
                <h5 className="font-semibold text-yellow-600 dark:text-yellow-400 mb-2">The Challenge</h5>
                <ul className="text-sm text-secondary space-y-1">
                  <li>• Need to build faster than ever</li>
                  <li>• While maintaining reliability</li>
                  <li>• While managing costs</li>
                  <li>• While navigating geopolitics</li>
                </ul>
              </div>
            </div>
            <p className="text-sm text-primary font-medium mt-4 text-center">
              It&apos;s hard, but doable—if we&apos;re smart about it.
            </p>
          </CollapsibleSection>

          {/* Section 8: Final Thoughts */}
          <CollapsibleSection title="8. Final Thoughts" id="final">
            <h3 className="text-lg font-semibold text-primary mb-4">The Core Message</h3>
            <InfoCard variant="default">
              <p className="text-base leading-relaxed">
                <strong className="text-primary">Energy is not just another policy issue.</strong>
              </p>
              <p className="mt-2">
                Energy is the foundation of prosperity, the basis of national security, the determinant of quality of life, and the shape of the future we&apos;re building.
              </p>
            </InfoCard>

            <div className="grid md:grid-cols-2 gap-4 my-6">
              <div className="card p-5">
                <h5 className="font-semibold text-green-600 dark:text-green-400 mb-2">When energy works:</h5>
                <ul className="text-sm text-secondary space-y-1">
                  <li>• Economies grow</li>
                  <li>• People prosper</li>
                  <li>• Countries stay secure</li>
                  <li>• Futures look bright</li>
                </ul>
              </div>
              <div className="card p-5 border-l-4 border-l-red-500">
                <h5 className="font-semibold text-red-600 dark:text-red-400 mb-2">When energy fails:</h5>
                <ul className="text-sm text-secondary space-y-1">
                  <li>• Economies contract</li>
                  <li>• People suffer</li>
                  <li>• Countries become vulnerable</li>
                  <li>• Futures look dark</li>
                </ul>
              </div>
            </div>

            <p className="text-lg text-primary font-medium text-center mb-8">It really is that fundamental.</p>

            <h3 className="text-lg font-semibold text-primary mb-4">Why Hyperion Exists</h3>
            <p className="text-secondary leading-relaxed mb-4">
              We built Hyperion because energy policy deserves serious, honest, data-driven analysis.
            </p>
            <div className="card p-5 mb-6">
              <h4 className="font-semibold text-primary mb-3">We believe:</h4>
              <div className="grid md:grid-cols-2 gap-3">
                <div className="flex items-center gap-2 text-sm text-secondary">
                  <span className="text-green-500">✓</span> Transparency beats propaganda
                </div>
                <div className="flex items-center gap-2 text-sm text-secondary">
                  <span className="text-green-500">✓</span> Data beats ideology
                </div>
                <div className="flex items-center gap-2 text-sm text-secondary">
                  <span className="text-green-500">✓</span> Long-term thinking beats short-term politics
                </div>
                <div className="flex items-center gap-2 text-sm text-secondary">
                  <span className="text-green-500">✓</span> Informed citizens make better democracies
                </div>
              </div>
            </div>

            <h3 className="text-lg font-semibold text-primary mb-4">The Ask</h3>
            <QuoteBlock>
              If you take one thing from this page: Energy policy matters more than you think. It affects your wallet, your job, your security, your children&apos;s future. Pay attention to it. Ask questions about it. Vote with it in mind. Because the decisions being made right now will echo for decades.
            </QuoteBlock>

            <h3 className="text-lg font-semibold text-primary mb-4 mt-8">Three Things You Can Do Right Now</h3>
            <div className="grid md:grid-cols-3 gap-4 mb-8">
              <div className="card p-5 text-center">
                <div className="text-3xl mb-2">🔍</div>
                <h5 className="font-semibold text-primary mb-2">1. Explore Your Country</h5>
                <p className="text-sm text-secondary mb-3">Use Hyperion to understand your country&apos;s energy reality</p>
                <Link href="/" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
                  Explore the map →
                </Link>
              </div>
              <div className="card p-5 text-center">
                <div className="text-3xl mb-2">❓</div>
                <h5 className="font-semibold text-primary mb-2">2. Ask Questions</h5>
                <p className="text-sm text-secondary">Next time you hear an energy proposal, ask about costs, backup plans, dependencies</p>
              </div>
              <div className="card p-5 text-center">
                <div className="text-3xl mb-2">📤</div>
                <h5 className="font-semibold text-primary mb-2">3. Share This</h5>
                <p className="text-sm text-secondary">Send this to someone who cares about the future—parents, teachers, anyone who pays an electricity bill</p>
              </div>
            </div>

            <div className="card p-6 text-center bg-inset">
              <p className="text-lg text-primary font-medium mb-2">Energy is too important for apathy.</p>
              <p className="text-secondary">Get informed. Ask questions. Demand better.</p>
            </div>
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
      </main>

      <Footer />
    </div>
  );
}
