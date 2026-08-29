import React from "react";
import { TopNav } from "../../components/nav/TopNav.jsx";
import { SiteFooter } from "../../components/nav/SiteFooter.jsx";
import { Eyebrow } from "../../components/core/Eyebrow.jsx";
import { Pill } from "../../components/core/Pill.jsx";
import { GorillaNote } from "../../components/core/GorillaNote.jsx";
import { DataTable } from "../../components/data/DataTable.jsx";
import { MixBar } from "../../components/data/MixBar.jsx";
import { Sparkline } from "../../components/data/Sparkline.jsx";
import { RANKINGS } from "./data.js";

const RANKING_MEASURES = ["Clean %", "Per person", "Total output", "Wind share", "Solar share"];

export function Rankings({ onNavigate, mark = "../../assets/gorilla-dark.svg", home = "IE" }) {
  const [measure, setMeasure] = React.useState("Clean %");
  return (
    <div className="gg-page" style={{ background: "var(--bg-page)", minHeight: "100vh" }}>
      <TopNav active="Rankings" meta="214 countries · 1985 → 2026" mark={mark} onNavigate={onNavigate} />
      <div style={{ padding: "var(--band-y) var(--gutter)" }}>
        <Eyebrow style={{ marginBottom: "var(--space-6)" }}>Rankings</Eyebrow>
        <h1 style={{ margin: 0, fontSize: "var(--fs-h2)", fontWeight: "var(--fw-bold)", letterSpacing: "var(--ls-h2)", maxWidth: "24ch" }}>
          Every grid on Earth, ordered by how clean it is.
        </h1>
        <div className="gg-scroll-row" style={{ display: "flex", gap: "var(--space-4)", flexWrap: "wrap", margin: "var(--space-8) 0 var(--space-9)" }}>
          {RANKING_MEASURES.map((m) => <Pill key={m} selected={m === measure} onClick={() => setMeasure(m)}>{m}</Pill>)}
        </div>
        <DataTable
          highlightRow={home}
          onRowClick={() => onNavigate && onNavigate("Explore")}
          columns={[
            { key: "rank", label: "#", mono: true, width: 56 },
            { key: "country", label: "Country" },
            { key: "mix", label: "Generation mix", mobileOptional: true, render: (r) => <MixBar series={r.series} height={10} /> },
            { key: "trend", label: "Trend", width: 110, mobileOptional: true, render: (r) => <Sparkline values={r.trend} color={r.id === home ? "var(--green)" : "var(--paper-a55)"} /> },
            { key: "clean", label: "Clean %", mono: true, align: "right", width: 96 },
            { key: "perCap", label: "kWh / person", mono: true, align: "right", width: 120, mobileOptional: true },
          ]}
          rows={RANKINGS}
        />
        <GorillaNote lead="The top of this table is geology, not policy." mark={mark}>
          Iceland, Norway and Brazil are clean because of where they are. Sweden and France chose it. That distinction matters more than the ranking does.
        </GorillaNote>
      </div>
      <SiteFooter mark={mark} />
    </div>
  );
}
