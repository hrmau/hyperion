import { Eyebrow } from '@/components/ds/core/Eyebrow';
import type { GridMetric } from '@/lib/gridMetrics';

/**
 * The measures under the hook, each carrying its own definition.
 *
 * Three cards rather than a row of bare figures, because the explanation is the
 * point. A reader who does not already know what carbon intensity is learns it
 * here, without hovering anything or leaving the page, and a reader who does
 * know can read the number and skip the rest - the value is set large and the
 * definition small, so the two audiences are served by the same card.
 */
export default function GridMetrics({ metrics }: { metrics: GridMetric[] }) {
  if (!metrics.length) return null;

  return (
    <div
      className="gg-card-row"
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(auto-fit, minmax(260px, 1fr))`,
        gap: 'var(--space-5)',
        maxWidth: '108ch',
      }}
    >
      {metrics.map((m) => (
        <div
          key={m.key}
          style={{
            display: 'flex',
            flexDirection: 'column',
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
              color: 'var(--text-primary)',
            }}
          >
            {m.verdict}
          </p>

          <p
            style={{
              margin: 'auto 0 0',
              paddingTop: 'var(--space-5)',
              borderTop: '1px solid var(--border-default)',
              fontSize: 'var(--fs-body-sm)',
              lineHeight: 'var(--lh-body-sm)',
              color: 'var(--text-tertiary)',
            }}
          >
            {m.meaning}
          </p>
        </div>
      ))}
    </div>
  );
}
