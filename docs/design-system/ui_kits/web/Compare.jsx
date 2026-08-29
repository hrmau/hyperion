import React from "react";
import { TopNav } from "../../components/nav/TopNav.jsx";
import { SiteFooter } from "../../components/nav/SiteFooter.jsx";
import { Eyebrow } from "../../components/core/Eyebrow.jsx";
import { Stat } from "../../components/core/Stat.jsx";
import { GorillaNote } from "../../components/core/GorillaNote.jsx";
import { StackedAreaChart } from "../../components/data/StackedAreaChart.jsx";
import { FuelLegend } from "../../components/data/FuelLegend.jsx";
import { DonutStat } from "../../components/data/DonutStat.jsx";

const A = { name: "Ireland", clean: 41, series: { wind:[0,2,12,34], solar:[0,0,1,4], gas:[8,22,38,42], coal:[62,44,22,6], other:[30,32,27,14] },
  shares: [{fuel:"wind",value:34},{fuel:"solar",value:4},{fuel:"gas",value:42},{fuel:"coal",value:6},{fuel:"other",value:14}],
  stats: [{label:"Wind share",value:"34%",tone:"accent"},{label:"Per person",value:"6,100",note:"kWh"}] };
const B = { name: "United Kingdom", clean: 56, series: { wind:[0,1,9,29], solar:[0,0,1,5], gas:[1,30,45,32], coal:[65,33,28,0], other:[34,36,17,34] },
  shares: [{fuel:"wind",value:29},{fuel:"solar",value:5},{fuel:"gas",value:32},{fuel:"coal",value:0},{fuel:"other",value:34}],
  stats: [{label:"Wind share",value:"29%"},{label:"Per person",value:"4,300",note:"kWh"}] };

function Side({ c, border }) {
  return (
    <div style={{ padding: "30px var(--gutter)", borderRight: border ? "1px solid var(--border-default)" : undefined }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: "var(--space-7)" }}>
        <h2 style={{ margin: 0, fontSize: "var(--fs-h3)", fontWeight: "var(--fw-bold)", letterSpacing: "var(--ls-h3)" }}>{c.name}</h2>
        <DonutStat value={c.clean} label="Clean" size={72} />
      </div>
      <StackedAreaChart series={c.series} years={[1990,2000,2010,2026]} height={180} />
      <FuelLegend shares={c.shares} style={{ marginTop: "var(--space-5)" }} />
      <div className="gg-stat-row" style={{ display: "flex", gap: "var(--space-9)", marginTop: "var(--space-8)", paddingTop: "var(--space-7)", borderTop: "1px solid var(--border-default)" }}>
        {c.stats.map((s) => <Stat key={s.label} {...s} />)}
      </div>
    </div>
  );
}

export function Compare({ onNavigate, mark = "../../assets/gorilla-dark.svg" }) {
  return (
    <div className="gg-page" style={{ background: "var(--bg-page)", minHeight: "100vh" }}>
      <TopNav active="Compare" mark={mark} onNavigate={onNavigate} />
      <div style={{ padding: "var(--band-y) var(--gutter) 0" }}>
        <Eyebrow style={{ marginBottom: "var(--space-6)" }}>Compare · two grids</Eyebrow>
        <h1 style={{ margin: 0, fontSize: "var(--fs-h2)", fontWeight: "var(--fw-bold)", letterSpacing: "var(--ls-h2)", maxWidth: "26ch" }}>
          Ireland and the UK started the same. One of them killed coal.
        </h1>
      </div>
      <div className="gg-compare-split" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", marginTop: "var(--space-9)", borderTop: "1px solid var(--border-default)" }}>
        <Side c={A} border />
        <Side c={B} />
      </div>
      <div style={{ padding: "0 var(--gutter) var(--space-10)" }}>
        <GorillaNote lead="Same weather, different decade." mark={mark}>
          Both built wind at almost the same rate. The UK spent its coal share on gas and then on wind; Ireland still runs Moneypoint, and that last 6% is the whole remaining argument.
        </GorillaNote>
      </div>
      <SiteFooter mark={mark} />
    </div>
  );
}
