'use client';

import { useId, useState, type CSSProperties, type ReactNode } from 'react';

/**
 * One metric, two selections.
 *
 * Replaces a 100%-stacked bar that split the track by `a / (a + b)`. For two
 * percentages that is arithmetic on incompatible denominators - clean share
 * 31.7% against 37.3% drew as 46/54 - and it flattened real gaps, because
 * independence 68 against 3, a 23x difference, drew as 96/4.
 *
 * Two encodings, chosen by unit:
 *
 * - `share`: a dumbbell on a shared 0-100 axis, so both marks sit on the scale
 *   the number actually lives on.
 * - `absolute`: paired bars normalised to the larger of the two, because a
 *   shared linear axis across the generation range puts most countries in the
 *   first pixel.
 *
 * The track is a real button. Clicking or focusing it opens the rank and the
 * context below the row rather than in a floating panel, which means keyboard
 * and touch get exactly what a pointer gets, there is no positioning to clamp,
 * and nothing overlays the thing it is describing.
 */

export type CompareEncoding = 'share' | 'absolute';

export interface CompareSide {
  /** ISO3, or a short bloc name. Carried in text so colour is never the only signal. */
  code: string;
  name: string;
  value: number;
  /** The independence asterisk, where fossil data is missing. */
  suffix?: string;
  /** "65th of 196", when both sides are countries. */
  rank?: string;
  /** One line about this country on this metric. */
  note?: ReactNode;
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
  /** What the median means here, shown when the row is open. */
  medianNote?: ReactNode;
  /**
   * Decimal places the values are printed to.
   *
   * The chip is computed from figures rounded to this, not from the raw ones,
   * so a reader who divides the two numbers on screen gets the number on the
   * chip. Carbon intensity prints whole grams: unrounded it read "14.2x" beside
   * 41 g and 589 g, which divide to 14.4.
   */
  dp?: number;
  style?: CSSProperties;
}

/**
 * Two identities, three tokens, no new colours.
 *
 * An earlier pass gave neither country a hue - a filled mark against a ring -
 * on the grounds that the fuel ramp owns the whole cold-slate-to-green space
 * and anything picked would collide with a fuel in the mix bars below. That was
 * true and it was still the wrong call: two near-identical marks made the reader
 * work out which country was which on every single row, which is a worse failure
 * than a colour that rhymes with a fuel two sections away.
 *
 * Green and paper are as far apart as this palette goes. The legend above the
 * block names both, the value cells carry the same colour as the mark, and the
 * ISO code sits in text beside every number - so the colour is the fastest
 * signal but never the only one. Clay marks the world median, a third thing
 * that belongs to neither country.
 */
export const TONE_A = 'var(--green)';
export const TONE_B = 'var(--paper)';
export const TONE_MEDIAN = 'var(--clay)';

const MARK = 11;
const TRACK_H = 3;

function relation(
  a: number,
  b: number,
  encoding: CompareEncoding,
  higherIsBetter: boolean,
  codeA: string,
  codeB: string
): { text: string; tone: string; level: boolean } | null {
  const aLeads = a >= b;
  const lead = aLeads ? a : b;
  const trail = aLeads ? b : a;
  const leadCode = aLeads ? codeA : codeB;
  const gap = lead - trail;
  const ratio = trail > 0 ? lead / trail : Infinity;

  const level =
    (encoding === 'share' && gap < 0.5) || (encoding === 'absolute' && ratio < 1.05);
  if (level) return { text: 'Roughly level', tone: 'var(--text-quiet)', level: true };

  // Leading a metric where higher is worse is not a win, and the chip says so
  // in clay - the system's one warm colour, for a measure going the wrong way.
  const tone = higherIsBetter ? (aLeads ? TONE_A : TONE_B) : TONE_MEDIAN;
  const asRatio = !Number.isFinite(ratio) ? `${leadCode} only` : `${leadCode} ${ratio.toFixed(1)}×`;

  if (encoding === 'share' && gap < 10) {
    return { text: `${leadCode} +${gap.toFixed(1)} pts`, tone, level: false };
  }
  return { text: higherIsBetter ? asRatio : `${asRatio} more`, tone, level: false };
}

export function CompareRow({
  label,
  a,
  b,
  format,
  encoding,
  higherIsBetter = true,
  median,
  medianNote,
  dp = 1,
  style,
}: CompareRowProps) {
  const [open, setOpen] = useState(false);
  const panelId = useId();

  const shown = (v: number) => Number(v.toFixed(dp));
  const rel = relation(shown(a.value), shown(b.value), encoding, higherIsBetter, a.code, b.code);
  const scaleMax = encoding === 'share' ? 100 : Math.max(a.value, b.value, 1);
  const pos = (v: number) => Math.max(0, Math.min(100, (v / scaleMax) * 100));

  // On an absolute row the median is often under 2% of the larger value, which
  // puts the tick under the axis and out of reach. Clamped so it stays visible;
  // the figure itself is printed, so the position implies nothing the text does
  // not state.
  const medianPos = median != null ? Math.max(1.2, Math.min(98.8, pos(median))) : null;
  const hasDetail = Boolean(a.rank || b.rank || a.note || b.note || medianNote);

  return (
    <div style={{ borderTop: '1px solid var(--border-subtle)', ...style }}>
      {/*
        The whole row is the control, not just the chart inside it. The track
        alone put the target most of the row's width away from where a reader
        looks first - the metric name - and nothing about a bare chart says it
        opens. Label, chip, marks and values are one button now, with the +/-
        marker the rest of the site uses for a disclosure.
      */}
      <button
        type="button"
        className={hasDetail ? 'gg-row-toggle' : undefined}
        aria-expanded={hasDetail ? open : undefined}
        aria-controls={hasDetail ? panelId : undefined}
        onClick={() => hasDetail && setOpen((v) => !v)}
        style={{
          appearance: 'none',
          background: 'none',
          border: 'none',
          margin: 0,
          padding: 'var(--space-7) var(--space-5)',
          width: '100%',
          textAlign: 'left',
          font: 'inherit',
          color: 'inherit',
          cursor: hasDetail ? 'pointer' : 'default',
          display: 'block',
        }}
      >
      <div
        style={{
          display: 'flex',
          alignItems: 'baseline',
          justifyContent: 'space-between',
          gap: 'var(--space-5)',
          marginBottom: 'var(--space-5)',
        }}
      >
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'baseline',
            gap: 'var(--space-4)',
            fontSize: 'var(--fs-body-sm)',
            color: 'var(--text-primary)',
          }}
        >
          {hasDetail && (
            <span
              aria-hidden
              className="gg-row-marker"
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 'var(--fs-mono)',
                color: 'var(--text-tertiary)',
                width: '1ch',
              }}
            />
          )}
          {label}
        </span>
        {rel && (
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--fs-mono-xs)',
              letterSpacing: '0.04em',
              color: rel.tone,
              border: `1px solid ${rel.level ? 'var(--line)' : rel.tone}`,
              borderRadius: 'var(--r-pill)',
              padding: '2px 9px',
              whiteSpace: 'nowrap',
              // The pill is an outline, not a fill: a filled green chip would be
              // the loudest thing on a page that spends green three times.
              opacity: rel.level ? 0.7 : 1,
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
              <Track />
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
              <Mark left={pos(a.value)} tone={TONE_A} />
              <Mark left={pos(b.value)} tone={TONE_B} />
            </div>
          ) : (
            <div style={{ position: 'relative', display: 'grid', gap: 'var(--space-2)' }}>
              <Bar pct={pos(a.value)} tone={TONE_A} />
              <Bar pct={pos(b.value)} tone={TONE_B} />
              {medianPos != null && <MedianTick left={medianPos} full />}
            </div>
          )}
        </div>

        <div style={{ display: 'grid', gap: 'var(--space-2)', flex: 'none' }}>
          {[
            { s: a, tone: TONE_A },
            { s: b, tone: TONE_B },
          ].map(({ s, tone }) => (
            <div
              key={s.code + s.name}
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 'var(--fs-mono-sm)',
                fontVariantNumeric: 'tabular-nums',
                textAlign: 'right',
                whiteSpace: 'nowrap',
                color: tone,
              }}
            >
              <span
                style={{
                  fontSize: 'var(--fs-mono-xxs)',
                  letterSpacing: 'var(--ls-label)',
                  opacity: 0.7,
                  marginRight: 'var(--space-3)',
                }}
              >
                {s.code}
              </span>
              {format(s.value)}
              {s.suffix}
            </div>
          ))}
        </div>
      </div>

      </button>

      {hasDetail && open && (
        <div
          id={panelId}
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 'var(--space-8)',
            margin: '0 var(--space-5) var(--space-7)',
            padding: 'var(--space-6) var(--space-7)',
            borderRadius: 'var(--r-well)',
            background: 'var(--bg-raised)',
          }}
        >
          {[
            { s: a, tone: TONE_A },
            { s: b, tone: TONE_B },
          ].map(({ s, tone }) =>
            s.rank || s.note ? (
              <div key={s.code} style={{ minWidth: 180, flex: '1 1 180px' }}>
                <Label tone={tone}>
                  {s.name} {s.rank ? `· ${s.rank}` : ''}
                </Label>
                {s.note && <Detail>{s.note}</Detail>}
              </div>
            ) : null
          )}
          {median != null && (
            <div style={{ minWidth: 180, flex: '1 1 180px' }}>
              <Label tone={TONE_MEDIAN}>World median · {format(median)}</Label>
              {medianNote && <Detail>{medianNote}</Detail>}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Label({ tone, children }: { tone: string; children: ReactNode }) {
  return (
    <div
      style={{
        fontFamily: 'var(--font-mono)',
        fontSize: 'var(--fs-mono-xxs)',
        letterSpacing: 'var(--ls-label)',
        textTransform: 'uppercase',
        color: tone,
        marginBottom: 'var(--space-3)',
      }}
    >
      {children}
    </div>
  );
}

const Detail = ({ children }: { children: ReactNode }) => (
  <p style={{ margin: 0, fontSize: 'var(--fs-body-sm)', lineHeight: 'var(--lh-body-sm)', color: 'var(--text-secondary)' }}>
    {children}
  </p>
);

const Track = () => (
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
);

function Mark({ left, tone }: { left: number; tone: string }) {
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
        background: tone,
        // A hairline in the page ground, so two marks that land on top of each
        // other still read as two.
        border: '2px solid var(--bg-page)',
        boxSizing: 'content-box',
      }}
    />
  );
}

const Bar = ({ pct, tone }: { pct: number; tone: string }) => (
  <div style={{ height: 11, borderRadius: 3, background: 'var(--bg-raised)', overflow: 'hidden' }}>
    <div style={{ width: `${pct}%`, height: '100%', background: tone, borderRadius: 3 }} />
  </div>
);

const MedianTick = ({ left, full = false }: { left: number; full?: boolean }) => (
  <span
    aria-hidden
    style={{
      position: 'absolute',
      left: `${left}%`,
      top: full ? -3 : '10%',
      bottom: full ? -3 : '10%',
      width: 2,
      borderRadius: 1,
      background: TONE_MEDIAN,
      opacity: 0.85,
    }}
  />
);

/** Names the two marks and the tick, so no colour has to be guessed. */
export function CompareLegend({ a, b }: { a: string; b: string }) {
  const item = (tone: string, text: string, tick = false) => (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-3)' }}>
      <i
        style={{
          width: tick ? 2 : 9,
          height: tick ? 12 : 9,
          borderRadius: tick ? 1 : '50%',
          background: tone,
          flex: 'none',
        }}
      />
      {text}
    </span>
  );
  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 'var(--space-8)',
        marginBottom: 'var(--space-7)',
        fontSize: 'var(--fs-body-sm)',
        color: 'var(--text-secondary)',
      }}
    >
      {item(TONE_A, a)}
      {item(TONE_B, b)}
      {item(TONE_MEDIAN, 'World median', true)}
    </div>
  );
}
