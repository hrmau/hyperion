import React from "react";
import { TopNav } from "../../components/nav/TopNav.jsx";
import { SiteFooter } from "../../components/nav/SiteFooter.jsx";
import { Breadcrumbs, Tabs, SegmentedControl } from "../../components/nav/Navigation.jsx";
import { Eyebrow } from "../../components/core/Eyebrow.jsx";
import { Stat } from "../../components/core/Stat.jsx";
import { Button } from "../../components/core/Button.jsx";
import { GorillaNote } from "../../components/core/GorillaNote.jsx";
import { Tooltip, DefinedTerm } from "../../components/feedback/Feedback.jsx";
import { StackedAreaChart } from "../../components/data/StackedAreaChart.jsx";
import { FuelLegend } from "../../components/data/FuelLegend.jsx";
import { DonutStat } from "../../components/data/DonutStat.jsx";
import { RankedBarList } from "../../components/data/RankedBarList.jsx";
import { LineChart } from "../../components/data/Charts.jsx";
import { DataNote } from "../../components/content/Prose.jsx";
import { IRELAND } from "./data.js";

const TABS = [
  { value: "mix", label: "Generation mix" },
  { value: "trend", label: "Trends" },
  { value: "peers", label: "Peers" },
];

export function Country({ onNavigate, mark = "../../assets/gorilla-dark.svg" }) {
  const c = IRELAND;
  const [tab, setTab] = React.useState("mix");
  const [mode, setMode] = React.useState("Share");

  return (
    <div className="gg-page" style={{ background: "var(--bg-page)", minHeight: "100vh" }}>
      <TopNav active="Explore" location={c.name} mark={mark} onNavigate={onNavigate} />

      <div style={{ padding: "var(--band-y) var(--gutter) var(--space-8)" }}>
        <Breadcrumbs style={{ marginBottom: "var(--space-8)" }}
          items={[{ label: "Explore", href: "#" }, { label: "Europe", href: "#" }, { label: c.name }]} />
        <div style={{ display: "flex", alignItems: "flex-start", gap: "var(--space-10)", flexWrap: "wrap" }}>
          <div style={{ flex: "1 1 420px" }}>
            <h1 style={{
              margin: 0, fontSize: "var(--fs-h2)", fontWeight: "var(--fw-bold)",
              letterSpacing: "var(--ls-h2)", lineHeight: "var(--lh-h2)",
            }}>{c.name}</h1>
            <p style={{
              margin: "var(--space-6) 0 0", maxWidth: "var(--maxw-lead)",
              fontSize: "var(--fs-lead)", lineHeight: "var(--lh-lead)", color: "var(--text-secondary)", textWrap: "pretty",
            }}>
              Second in the world for wind, and still burning gas for 42% of its power. Its{" "}
              <DefinedTerm term="capacity factor" definition="Actual output ÷ theoretical maximum" /> for onshore wind is among the highest in Europe.
            </p>
          </div>
          <DonutStat value={41} label="Clean" size={112} />
        </div>
        <div className="gg-stat-row" style={{
          display: "flex", gap: "var(--space-9)", flexWrap: "wrap",
          marginTop: "var(--space-9)", padding: "var(--space-8) 0",
          borderTop: "1px solid var(--border-default)", borderBottom: "1px solid var(--border-default)",
        }}>
          {c.stats.map((s) => <Stat key={s.label} size="lg" {...s} />)}
        </div>
        <div className="gg-action-row" style={{ display: "flex", gap: "var(--space-4)", marginTop: "var(--space-8)", flexWrap: "wrap" }}>
          <Button variant="primary" onClick={() => onNavigate && onNavigate("Compare")}>Compare with another grid</Button>
          <Button variant="secondary">Download this data (CSV)</Button>
        </div>
      </div>

      <div style={{ padding: "0 var(--gutter)" }}>
        <Tabs items={TABS} active={tab} onChange={setTab} />
      </div>

      <div style={{ padding: "var(--space-9) var(--gutter) var(--space-10)" }}>
        {tab === "mix" && (
          <>
            <div style={{ display: "flex", alignItems: "center", gap: "var(--space-6)", marginBottom: "var(--space-7)", flexWrap: "wrap" }}>
              <Eyebrow>Mix since {c.years[0]}</Eyebrow>
              <SegmentedControl options={["Share", "Absolute"]} value={mode} onChange={setMode} style={{ marginLeft: "auto" }} />
            </div>
            <StackedAreaChart series={c.series} years={c.years} height={300} />
            <FuelLegend shares={c.shares} style={{ marginTop: "var(--space-5)" }} />
            <GorillaNote lead={c.note.lead} mark={mark}>{c.note.body}</GorillaNote>
          </>
        )}

        {tab === "trend" && (
          <>
            <Eyebrow style={{ marginBottom: "var(--space-7)" }}>Wind share vs. neighbours</Eyebrow>
            <LineChart height={280} ticks={c.years} series={[
              { label: "Ireland", values: [0, 2, 12, 34], color: "var(--green)", emphasis: true },
              { label: "United Kingdom", values: [0, 1, 9, 29], color: "var(--sage-deep)" },
              { label: "Denmark", values: [2, 12, 24, 55], color: "var(--fuel-hydro)", dashed: true },
            ]} />
            <GorillaNote lead="Denmark started a decade earlier." mark={mark}>
              Ireland's curve is steeper but shorter. On current trajectory the two lines cross sometime in the 2030s.
            </GorillaNote>
          </>
        )}

        {tab === "peers" && (
          <>
            <Eyebrow style={{ marginBottom: "var(--space-7)" }}>Similar-sized grids, ranked by clean share</Eyebrow>
            <RankedBarList showRank labelWidth={120} barHeight={12} items={[
              { label: "New Zealand", value: 82, display: "82%" },
              { label: "Portugal", value: 71, display: "71%" },
              { label: "Denmark", value: 68, display: "68%" },
              { label: "Ireland", value: 41, display: "41%", tone: "accent" },
              { label: "Israel", value: 12, display: "12%", tone: "down" },
            ]} />
            <GorillaNote lead="Size is not the constraint." mark={mark}>
              Every grid on this list serves between three and eleven million people. The spread between them is policy and geography, not scale.
            </GorillaNote>
          </>
        )}

        <DataNote
          sources={["Ember — generation, 2000–2026", "IEA — historic series, 1985–1999", "World Bank — population"]}
          method="Shares are calendar-year generation, not capacity. Imports are attributed to the exporting grid."
          caveat="Behind-the-meter rooftop solar is under-counted in every country, Ireland included."
          updated="June 2026"
        />
      </div>

      <SiteFooter mark={mark} />
    </div>
  );
}
