import type { CSSProperties } from 'react';

/**
 * One metric, two selections.
 *
 * Replaces a 100%-stacked bar that split the track by `a / (a + b)`. For two
 * percentages that is arithmetic on incompatible denominators - clean share
 * 31.7% against 37.3% drew as 46/54 - and it flattened real gaps, because
 * independence 68 against 3, a 23x difference, drew as 96/4 and read as "a lot
 * more" rather than "an order of magnitude more".
 *
 * Two encodings, chosen by unit:
 *
 * - `share`: a dumbbell on a shared 0-100 axis. Both marks sit on the scale the
 *   number actually lives on, so 45% and 60% read as two values well under a
 *   ceiling rather than as a ratio.
 * - `absolute`: paired bars normalised to the larger of the two. A shared linear
 *   axis across the generation range would put most countries in the first pixel.
 */

export type CompareEncoding = 'share' | 'absolute';

export interface CompareSide {
  /** ISO3, or a short bloc name. Carried in text so colour is never the only signal. */
  code: string;
  value: number;
  /** The independence asterisk, where fossil data is missing. */
  suffix?: string;
}

export interface CompareRowProps {
  label: string;
  a: CompareSide;
  b: CompareSide;
  format: (v: number) => string;
  encoding: CompareEncoding;
  /** Emissions and carbon intensity read the other way round. */
  higherIsBetter?: boolean;
  /** World median for the metric and year. Omitted for blocs, which have no rank. */
  median?: number | null;
  /**
   * Decimal places the values are printed to.
   *
   * The chip is computed from figures rounded to this, not from the raw ones,
   * so a reader who divides the two numbers on screen gets the number on the
   * chip. Carbon intensity prints whole grams: unrounded it read "14.2x" beside
   * 41 g and 589 g, which divide to 14.4. The extra precision was real and the
   * inconsistency was still the reader's problem.
   */
  dp?: number;
  style?: CSSProperties;
}

/**
 * Neither country gets a hue.
 *
 * The fuel ramp runs the whole cold-slate-to-green space - sage is solar,
 * sage-deep is hydro, green is wind - so any hue picked for a country collides
 * with a fuel in the mix bars directly below. The system's own answer is that
 * things are told apart by value, not hue, and that country identity is a mono
 * code. So: a filled mark for the first selection, a ring for the second, both
 * in paper, with the codes rendered in text beside the values.
 *
 * That also survives the marks swapping sides, which position alone would not:
 * whichever leads a row, the filled one is still the first selection.
 */
const MARK = 11;
const TRACK_H = 3;

const cell: CSSProperties = {
  fontFamily: 'var(--font-mono)',
  fontSize: 'var(--fs-mono-sm)',
  fontVariantNumeric: 'tabular-nums',
  textAlign: 'right',
  whiteSpace: 'nowrap',
};

const codeStyle: CSSProperties = {
  fontFamily: 'var(--font-mono)',
  fontSize: 'var(--fs-mono-xxs)',
  letterSpacing: 'var(--ls-label)',
  color: 'var(--text-quiet)',
  marginRight: 'var(--space-3)',
};

/**
 * What the chip says.
 *
 * A point gap under ten points, a ratio above it, and nothing at all when the
 * two are close enough that either would be noise. "Roughly level" is a real
 * finding and reads better than "1.02x".
 */
function relation(
  a: number,
  b: number,
  encoding: CompareEncoding,
  higherIsBetter: boolean,
  codeA: string,
  codeB: string
): { text: string; leaderIsWorse: boolean } | null {
  const lead = a >= b ? a : b;
  const trail = a >= b ? b : a;
  const leadCode = a >= b ? codeA : codeB;
  const gap = lead - trail;
  const ratio = trail > 0 ? lead / trail : Infinity;

  if (encoding === 'share' && gap < 0.5) return { text: 'Roughly level', leaderIsWorse: false };
  if (encoding === 'absolute' && ratio < 1.05) return { text: 'Roughly level', leaderIsWorse: false };

  const leaderIsWorse = !higherIsBetter;
  const asRatio = () =>
    !Number.isFinite(ratio) ? `${leadCode} only` : `${leadCode} ${ratio.toFixed(1)}×`;

  if (encoding === 'share' && gap < 10) {
    return { text: `${leadCode} +${gap.toFixed(1)} pts`, leaderIsWorse };
  }
  return { text: leaderIsWorse ? `${asRatio()} more` : asRatio(), leaderIsWorse };
}

export function CompareRow({
  label,
  a,
  b,
  format,
  encoding,
  higherIsBetter = true,
  median,
  dp = 1,
  style,
}: CompareRowProps) {
  const shown = (v: number) => Number(v.toFixed(dp));
  const rel = relation(shown(a.value), shown(b.value), encoding, higherIsBetter, a.code, b.code);
  const scaleMax = encoding === 'share' ? 100 : Math.max(a.value, b.value, 1);
  const pos = (v: number) => Math.max(0, Math.min(100, (v / scaleMax) * 100));

  /*
   * On an absolute row the world median is often under 2% of the larger value,
   * which puts the tick under the axis line and out of reach. Clamped so it
   * stays visible; the number itself is printed beneath, so nothing is implied
   * by the position that the text does not state.
   */
  const medianPos = median != null ? Math.max(1.2, Math.min(98.8, pos(median))) : null;

  return (
    <div style={style}>
      <div
        style={{
          display: 'flex',
          alignItems: 'baseline',
          justifyContent: 'space-between',
          gap: 'var(--space-5)',
          marginBottom: 'var(--space-4)',
        }}
      >
        <span style={{ fontSize: 'var(--fs-body-sm)', color: 'var(--text-secondary)' }}>{label}</span>
        {rel && (
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--fs-mono-xs)',
              letterSpacing: '0.04em',
              // Clay is the system's one warm colour and means a measure moving
              // the wrong way, which is exactly what leading on emissions is.
              color: rel.leaderIsWorse ? 'var(--clay)' : 'var(--text-label)',
              whiteSpace: 'nowrap',
            }}
          >
            {rel.text}
          </span>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-6)' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          {encoding === 'share' ? (
            <div style={{ position: 'relative', height: MARK + 8 }}>
              <div
                style={{
                  position: 'absolute',
                  top: `calc(50% - ${TRACK_H / 2}px)`,
                  left: 0,
                  right: 0,
                  height: TRACK_H,
                  borderRadius: TRACK_H,
                  background: 'var(--bg-raised)',
                }}
              />
              {/* The connector carries the gap: its length is the difference. */}
              <div
                style={{
                  position: 'absolute',
                  top: `calc(50% - ${TRACK_H / 2}px)`,
                  left: `${Math.min(pos(a.value), pos(b.value))}%`,
                  width: `${Math.abs(pos(a.value) - pos(b.value))}%`,
                  height: TRACK_H,
                  background: 'var(--line-strong)',
                }}
              />
              {medianPos != null && <MedianTick left={medianPos} />}
              <Mark left={pos(a.value)} filled />
              <Mark left={pos(b.value)} />
            </div>
          ) : (
            <div style={{ position: 'relative', display: 'grid', gap: 'var(--space-2)' }}>
              <Bar pct={pos(a.value)} filled />
              <Bar pct={pos(b.value)} />
              {medianPos != null && <MedianTick left={medianPos} full />}
            </div>
          )}

          {median != null && (
            <div
              style={{
                marginTop: 'var(--space-3)',
                fontFamily: 'var(--font-mono)',
                fontSize: 'var(--fs-mono-xxs)',
                letterSpacing: 'var(--ls-label)',
                color: 'var(--text-quiet)',
              }}
            >
              World median {format(median)}
            </div>
          )}
        </div>

        <div style={{ display: 'grid', gap: 'var(--space-2)', flex: 'none' }}>
          {[a, b].map((s, i) => (
            <div key={s.code + i} style={{ ...cell, color: 'var(--text-primary)' }}>
              <span style={codeStyle}>{s.code}</span>
              {format(s.value)}
              {s.suffix}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Mark({ left, filled = false }: { left: number; filled?: boolean }) {
  return (
    <span
      style={{
        position: 'absolute',
        left: `${left}%`,
        top: `calc(50% - ${MARK / 2}px)`,
        marginLeft: -MARK / 2,
        width: MARK,
        height: MARK,
        borderRadius: '50%',
        background: filled ? 'var(--paper)' : 'var(--bg-page)',
        border: filled ? 'none' : '2px solid var(--paper)',
        boxSizing: 'border-box',
      }}
    />
  );
}

function Bar({ pct, filled = false }: { pct: number; filled?: boolean }) {
  return (
    <div style={{ height: 10, borderRadius: 2, background: 'var(--bg-raised)', overflow: 'hidden' }}>
      <div
        style={{
          width: `${pct}%`,
          height: '100%',
          background: filled ? 'var(--paper)' : 'transparent',
          border: filled ? 'none' : '2px solid var(--paper)',
          borderRadius: 2,
          boxSizing: 'border-box',
        }}
      />
    </div>
  );
}

function MedianTick({ left, full = false }: { left: number; full?: boolean }) {
  return (
    <span
      aria-hidden
      style={{
        position: 'absolute',
        left: `${left}%`,
        top: full ? 0 : '15%',
        bottom: full ? 0 : '15%',
        width: 1,
        background: 'var(--paper-a42)',
      }}
    />
  );
}
