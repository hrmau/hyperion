'use client';

import { useMemo } from 'react';
import type { CorrelationDataPoint } from '@/lib/types';

interface InsightCardProps {
  data: CorrelationDataPoint[];
  rSquared: number | null;
}

interface Insight {
  /** Mono kicker above the claim. Replaces the emoji the design system forbids. */
  kicker: string;
  title: string;
  description: string;
}

function calculateInsights(data: CorrelationDataPoint[], rSquared: number | null): Insight[] {
  if (data.length === 0) return [];

  const insights: Insight[] = [];

  // Correlation strength insight
  if (rSquared !== null) {
    let strength = 'moderate';
    if (rSquared >= 0.7) strength = 'strong';
    if (rSquared >= 0.85) strength = 'very strong';

    insights.push({
      kicker: 'Correlation',
      title: `${strength.charAt(0).toUpperCase() + strength.slice(1)} Correlation`,
      description: `r² = ${rSquared.toFixed(2)} — ${Math.round(rSquared * 100)}% of the variance in prosperity metrics can be explained by electricity consumption.`,
    });
  }

  // Electricity threshold for high GDP
  const highGdpCountries = data.filter(d => d.gdp_per_capita_ppp >= 30000);
  const minElectricity = Math.min(...highGdpCountries.map(d => d.electricity_per_capita_kwh));

  if (highGdpCountries.length > 0) {
    insights.push({
      kicker: 'Threshold',
      title: 'No Wealthy Nation Without Power',
      description: `All ${highGdpCountries.length} countries with GDP >$30k have at least ${Math.round(minElectricity).toLocaleString()} kWh/capita. Prosperity requires energy abundance.`,
    });
  }

  // Development threshold insight
  const lowElectricity = data.filter(d => d.electricity_per_capita_kwh < 1000);
  const highElectricity = data.filter(d => d.electricity_per_capita_kwh >= 5000);

  if (lowElectricity.length > 0 && highElectricity.length > 0) {
    const avgHdiLow = lowElectricity.reduce((sum, d) => sum + d.hdi, 0) / lowElectricity.length;
    const avgHdiHigh = highElectricity.reduce((sum, d) => sum + d.hdi, 0) / highElectricity.length;
    const avgLifeLow = lowElectricity.reduce((sum, d) => sum + d.life_expectancy, 0) / lowElectricity.length;
    const avgLifeHigh = highElectricity.reduce((sum, d) => sum + d.life_expectancy, 0) / highElectricity.length;

    insights.push({
      kicker: 'Development',
      title: 'The Development Threshold',
      description: `Countries with >5,000 kWh/capita: HDI ${avgHdiHigh.toFixed(2)}, life expectancy ${avgLifeHigh.toFixed(0)} yrs. Below 1,000 kWh: HDI ${avgHdiLow.toFixed(2)}, life expectancy ${avgLifeLow.toFixed(0)} yrs.`,
    });
  }

  // Regional leader
  const sortedByElectricity = [...data].sort((a, b) => b.electricity_per_capita_kwh - a.electricity_per_capita_kwh);
  const leader = sortedByElectricity[0];

  if (leader) {
    insights.push({
      kicker: 'Leader',
      title: 'Top Energy Consumer',
      description: `${leader.name} leads with ${Math.round(leader.electricity_per_capita_kwh).toLocaleString()} kWh/capita, GDP $${Math.round(leader.gdp_per_capita_ppp / 1000)}k, and HDI ${leader.hdi.toFixed(2)}.`,
    });
  }

  return insights;
}

export default function InsightCard({ data, rSquared }: InsightCardProps) {
  const insights = useMemo(() => calculateInsights(data, rSquared), [data, rSquared]);

  if (insights.length === 0) return null;

  return (
    <div
      className="gg-card-row"
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: 'var(--space-6)',
      }}
    >
      {insights.map((insight) => (
        <div
          key={insight.title}
          style={{
            padding: 'var(--space-7)',
            borderRadius: 'var(--r-card)',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-default)',
          }}
        >
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--fs-mono-xxs)',
              letterSpacing: 'var(--ls-label)',
              textTransform: 'uppercase',
              color: 'var(--text-label)',
              marginBottom: 'var(--space-4)',
            }}
          >
            {insight.kicker}
          </div>
          <h3
            style={{
              margin: 0,
              fontSize: 'var(--fs-body)',
              fontWeight: 'var(--fw-semibold)',
              color: 'var(--text-primary)',
            }}
          >
            {insight.title}
          </h3>
          <p
            style={{
              margin: 'var(--space-4) 0 0',
              fontSize: 'var(--fs-caption)',
              lineHeight: 1.5,
              color: 'var(--text-tertiary)',
            }}
          >
            {insight.description}
          </p>
        </div>
      ))}
    </div>
  );
}
