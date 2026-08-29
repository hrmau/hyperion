import React from "react";

/* Shared chart chrome: a well, an optional grid, mono axis labels. All of
   these render plain SVG — no chart library, so nothing is styled by a
   third party's defaults. */
function Frame({ height, children, well = "var(--chart-well)", style, ...rest }) {
  return (
    <div style={{ position: "relative", background: well, borderRadius: "var(--r-well)", padding: 14, boxSizing: "border-box", ...style }} {...rest}>
      {children}
    </div>
  );
}

function Axis({ ticks, align = "x" }) {
  return (
    <div style={{
      display: "flex", justifyContent: "space-between", marginTop: "var(--space-3)",
      fontFamily: "var(--font-mono)", fontSize: "var(--fs-mono-xxs)", color: "var(--chart-axis-text)",
    }}>
      {ticks.map((t) => <span key={t}>{t}</span>)}
    </div>
  );
}

/* ── LineChart ───────────────────────────────────────────────────────────
   One to four series over time. Beyond four, the tamed palette runs out of
   separable values — use small multiples instead. */
export function LineChart({ series = [], ticks = [], height = 200, width = 480, yMax, style, ...rest }) {
  const n = Math.max(...series.map((s) => s.values.length), 0);
  const top = yMax ?? Math.max(...series.flatMap((s) => s.values), 1);
  const x = (i) => (i / (n - 1)) * width;
  const y = (v) => height - (v / top) * height;
  return (
    <div style={style} {...rest}>
      <Frame height={height}>
        <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" style={{ width: "100%", height, overflow: "visible" }}>
          {[0.25, 0.5, 0.75].map((g) => (
            <line key={g} x1="0" x2={width} y1={height * g} y2={height * g} stroke="var(--chart-grid)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
          ))}
          {series.map((s) => (
            <polyline key={s.label}
              points={s.values.map((v, i) => `${x(i)},${y(v)}`).join(" ")}
              fill="none" stroke={s.color || "var(--paper-a55)"}
              strokeWidth={s.emphasis ? 2.4 : 1.6}
              strokeDasharray={s.dashed ? "4 4" : undefined}
              vectorEffect="non-scaling-stroke" strokeLinejoin="round" />
          ))}
        </svg>
      </Frame>
      {ticks.length > 0 && <Axis ticks={ticks} />}
      {series.length > 1 && (
        <div style={{ display: "flex", gap: "var(--space-6)", flexWrap: "wrap", marginTop: "var(--space-4)" }}>
          {series.map((s) => (
            <span key={s.label} style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", fontFamily: "var(--font-mono)", fontSize: "var(--fs-mono-xs)", textTransform: "uppercase", color: "var(--text-secondary)" }}>
              <span style={{ width: 14, height: 2, background: s.color || "var(--paper-a55)" }} />{s.label}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── BarChart ────────────────────────────────────────────────────────────
   Vertical bars for a single series over discrete categories or years. For
   ranked comparisons across countries use RankedBarList (horizontal), which
   keeps long country names readable. */
export function BarChart({ items = [], height = 200, style, ...rest }) {
  const top = Math.max(...items.map((i) => i.value), 1);
  return (
    <div style={style} {...rest}>
      <Frame height={height}>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 4, height }}>
          {items.map((item) => (
            <div key={item.label} title={`${item.label}: ${item.value}`} style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "flex-end", height: "100%" }}>
              <div style={{
                height: `${(item.value / top) * 100}%`,
                background: item.color || (item.emphasis ? "var(--green)" : "var(--paper-a55)"),
                transition: "height var(--dur-chart) var(--ease-out)",
              }} />
            </div>
          ))}
        </div>
      </Frame>
      <Axis ticks={items.filter((_, i) => i % Math.ceil(items.length / 6) === 0).map((i) => i.label)} />
    </div>
  );
}

/* ── ScatterChart ────────────────────────────────────────────────────────
   The correlation view: electricity per person against any development
   measure. This is the chart that carries the product's central argument, so
   it gets axis titles by default and an explicit note about causation. */
export function ScatterChart({
  points = [], height = 320, width = 480, xLabel, yLabel,
  xMax, yMax, logX = false, highlight, style, ...rest
}) {
  const xs = points.map((p) => p.x), ys = points.map((p) => p.y);
  const xTop = xMax ?? Math.max(...xs, 1), yTop = yMax ?? Math.max(...ys, 1);
  const sx = (v) => (logX ? Math.log10(Math.max(v, 1)) / Math.log10(xTop) : v / xTop) * width;
  const sy = (v) => height - (v / yTop) * height;
  return (
    <div style={style} {...rest}>
      <Frame height={height}>
        <svg viewBox={`0 0 ${width} ${height}`} style={{ width: "100%", height, overflow: "visible" }}>
          {[0.25, 0.5, 0.75].map((g) => (
            <line key={g} x1="0" x2={width} y1={height * g} y2={height * g} stroke="var(--chart-grid)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
          ))}
          {points.map((p) => {
            const on = highlight === p.label;
            return (
              <g key={p.label}>
                <circle cx={sx(p.x)} cy={sy(p.y)} r={on ? 6 : 4}
                  fill={on ? "var(--green)" : p.color || "var(--paper-a55)"}
                  stroke={on ? "var(--green-ink)" : "none"} strokeWidth="1.5">
                  <title>{`${p.label}: ${p.x} / ${p.y}`}</title>
                </circle>
                {on && (
                  <text x={sx(p.x) + 10} y={sy(p.y) - 8} fill="var(--paper)"
                    style={{ fontFamily: "var(--font-mono)", fontSize: 11 }}>{p.label}</text>
                )}
              </g>
            );
          })}
        </svg>
      </Frame>
      <div style={{
        display: "flex", justifyContent: "space-between", marginTop: "var(--space-4)",
        fontFamily: "var(--font-mono)", fontSize: "var(--fs-mono-xxs)",
        letterSpacing: "var(--ls-label)", textTransform: "uppercase", color: "var(--text-label)",
      }}>
        <span>↑ {yLabel}</span><span>{xLabel} →</span>
      </div>
    </div>
  );
}

/* ── DiffBar ─────────────────────────────────────────────────────────────
   Two grids on one measure, mirrored from a centre line. The Compare page's
   unit of comparison. */
export function DiffBar({ label, left, right, leftLabel, rightLabel, max, style, ...rest }) {
  const top = max ?? Math.max(left, right, 1);
  return (
    <div style={{ ...style }} {...rest}>
      <div style={{
        display: "flex", justifyContent: "space-between", marginBottom: "var(--space-3)",
        fontFamily: "var(--font-mono)", fontSize: "var(--fs-mono-xxs)",
        letterSpacing: "var(--ls-label)", textTransform: "uppercase", color: "var(--text-label)",
      }}>
        <span>{leftLabel}</span><span style={{ color: "var(--text-secondary)" }}>{label}</span><span>{rightLabel}</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "var(--space-4)" }}>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--fs-mono-sm)", color: "var(--paper)", width: 52, textAlign: "right" }}>{left}</span>
        <div style={{ flex: 1, display: "flex", justifyContent: "flex-end", height: 12, background: "var(--chart-track)" }}>
          <div style={{ width: `${(left / top) * 100}%`, background: "var(--green)" }} />
        </div>
        <div style={{ width: 1, height: 20, background: "var(--line-strong)" }} />
        <div style={{ flex: 1, display: "flex", height: 12, background: "var(--chart-track)" }}>
          <div style={{ width: `${(right / top) * 100}%`, background: "var(--sage-deep)" }} />
        </div>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--fs-mono-sm)", color: "var(--paper)", width: 52 }}>{right}</span>
      </div>
    </div>
  );
}
