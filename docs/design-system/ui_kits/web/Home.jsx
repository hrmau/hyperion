import React from "react";
import { TopNav } from "../../components/nav/TopNav.jsx";
import { SiteFooter } from "../../components/nav/SiteFooter.jsx";
import { Eyebrow } from "../../components/core/Eyebrow.jsx";
import { Button } from "../../components/core/Button.jsx";
import { Stat } from "../../components/core/Stat.jsx";
import { GorillaNote } from "../../components/core/GorillaNote.jsx";
import { StackedAreaChart } from "../../components/data/StackedAreaChart.jsx";
import { FuelLegend } from "../../components/data/FuelLegend.jsx";
import { HookHeadline } from "../../components/content/HookHeadline.jsx";
import { HookCard } from "../../components/content/HookCard.jsx";
import { QuizCard } from "../../components/content/QuizCard.jsx";
import { IRELAND } from "./data.js";

/* The geolocated homepage. Structure, top to bottom:
   nav+location → hook (their country) → their chart → three compare cards. */
export function Home({ onNavigate, mark = "../../assets/gorilla-dark.svg" }) {
  const c = IRELAND;
  return (
    <div className="gg-page" style={{ background: "var(--bg-page)", minHeight: "100vh" }}>
      <TopNav active="Explore" location={c.name} mark={mark} onNavigate={onNavigate} />

      <div className="gg-hero-split" style={{ display: "grid", gridTemplateColumns: "1.12fr 1fr" }}>
        <div style={{ position: "relative", padding: "44px var(--gutter) 40px", overflow: "hidden", borderRight: "1px solid var(--border-default)" }}>
          <img src={mark} alt="" style={{ position: "absolute", left: -70, bottom: -90, width: 340, opacity: 0.045, transform: "rotate(9deg)" }} />
          <div style={{ position: "relative" }}>
            <Eyebrow tone="accent" style={{ marginBottom: "var(--space-8)" }}>◉ Your grid, right now</Eyebrow>
            <HookHeadline lead={c.hook.lead} highlight={c.hook.highlight} highlightTone={c.hook.tone} tail={c.hook.tail} />
            <p style={{ margin: "var(--space-8) 0 0", fontSize: "var(--fs-lead)", lineHeight: "var(--lh-lead)", color: "var(--text-secondary)", maxWidth: "var(--maxw-lead)", textWrap: "pretty" }}>
              {c.lead}
            </p>
            <div className="gg-stat-row" style={{ display: "flex", gap: "var(--space-9)", flexWrap: "wrap", marginTop: "var(--space-10)", padding: "var(--space-8) 0", borderTop: "1px solid var(--border-default)", borderBottom: "1px solid var(--border-default)" }}>
              {c.stats.map((s) => <Stat key={s.label} size="lg" {...s} />)}
            </div>
            <div className="gg-action-row" style={{ display: "flex", gap: "var(--space-4)", marginTop: "var(--space-9)", flexWrap: "wrap" }}>
              <Button variant="primary" size="lg" onClick={() => onNavigate && onNavigate("Explore")}>See {c.name}'s full profile</Button>
              <Button variant="secondary" size="lg" onClick={() => onNavigate && onNavigate("Compare")}>Compare with the UK</Button>
            </div>
          </div>
        </div>

        <div style={{ padding: "34px 30px 30px", background: "var(--bg-raised)" }}>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: "var(--space-7)" }}>
            <Eyebrow>{c.name} · mix since {c.years[0]}</Eyebrow>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--fs-mono-xs)", color: "var(--paper-a32)" }}>100% stacked</span>
          </div>
          <StackedAreaChart series={c.series} years={c.years} well="var(--bg-raised)" />
          <FuelLegend shares={c.shares} style={{ marginTop: "var(--space-5)" }} />
          <GorillaNote lead={c.note.lead} mark={mark}>{c.note.body}</GorillaNote>
        </div>
      </div>

      <div style={{ padding: "var(--band-y) var(--gutter)", borderTop: "1px solid var(--border-default)" }}>
        <Eyebrow style={{ marginBottom: "var(--space-7)" }}>How you compare</Eyebrow>
        <div className="gg-card-row" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "var(--space-6)" }}>
          <QuizCard question={`Does ${c.name} or Spain get more of its power from wind?`}
            options={[c.name, "Spain"]} footnote="58% of Irish visitors get this wrong."
            onAnswer={() => onNavigate && onNavigate("Play")} />
          <HookCard tone="card" eyebrow="Your neighbours" title="The UK cut coal to zero. Ireland still has 6%.">
            Moneypoint is the last one standing. Here's what happened either side of the Irish Sea.
          </HookCard>
          <HookCard tone="strong" eyebrow="The world" title="A third of the planet still runs on coal.">
            Zoom out to all 214 grids and see where Ireland actually sits.
          </HookCard>
        </div>
      </div>

      <SiteFooter mark={mark} />
    </div>
  );
}
