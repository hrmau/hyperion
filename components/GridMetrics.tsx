import { Eyebrow } from '@/components/ds/core/Eyebrow';
import type { GridMetric } from '@/lib/gridMetrics';

/**
 * The measures under the hook: a figure, a line about this country, and the
 * definition tucked behind a disclosure.
 *
 * The definitions were rendered open to begin with. They are the reason the
 * section exists - "carbon intensity" teaches nobody anything on its own - but
 * three paragraphs of prose turned a row a reader should take in at a glance
 * into something they had to work through. Behind a native <details> the card is
 * scannable again and the explanation is still one tap away, on every device,
 * with no JavaScript and nothing hidden from a screen reader.
 */
export default function GridMetrics({ metrics }: { metrics: GridMetric[] }) {
  if (!metrics.length) return null;

  return (
    <div
      className="gg-card-row"
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: 'var(--space-5)',
        maxWidth: '100ch',
        alignItems: 'start',
      }}
    >
      {metrics.map((m) => (
        <div
          key={m.key}
          style={{
            padding: 'var(--space-6)',
            borderRadius: 'var(--r-card)',
            border: '1px solid var(--border-default)',
            background: 'var(--bg-card)',
          }}
        >
          <Eyebrow style={{ marginBottom: 'var(--space-4)' }}>{m.label}</Eyebrow>

          <div
            style={{
              display: 'flex',
              alignItems: 'baseline',
              gap: 'var(--space-3)',
              flexWrap: 'wrap',
            }}
          >
            <span
              style={{
                fontSize: 'var(--fs-stat-sm)',
                fontWeight: 'var(--fw-bold)',
                letterSpacing: 'var(--ls-stat)',
                lineHeight: 'var(--lh-stat)',
                color:
                  m.tone === 'accent'
                    ? 'var(--green)'
                    : m.tone === 'down'
                      ? 'var(--clay)'
                      : 'var(--text-primary)',
              }}
            >
              {m.value}
            </span>
            {m.unit && (
              <span style={{ fontSize: 'var(--fs-ui)', color: 'var(--text-tertiary)' }}>
                {m.unit}
              </span>
            )}
          </div>

          <p
            style={{
              margin: 'var(--space-4) 0 var(--space-5)',
              fontSize: 'var(--fs-body)',
              lineHeight: 'var(--lh-body)',
              color: 'var(--text-secondary)',
            }}
          >
            {m.verdict}
          </p>

          <details className="gg-disclosure">
            <summary>What this means</summary>
            <p
              style={{
                margin: 'var(--space-4) 0 0',
                fontSize: 'var(--fs-body-sm)',
                lineHeight: 'var(--lh-body-sm)',
                color: 'var(--text-tertiary)',
              }}
            >
              {m.meaning}
            </p>
          </details>
        </div>
      ))}
    </div>
  );
}
