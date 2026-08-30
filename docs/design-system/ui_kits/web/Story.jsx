import React from "react";
import { TopNav } from "../../components/nav/TopNav.jsx";
import { SiteFooter } from "../../components/nav/SiteFooter.jsx";
import { TableOfContents, NextPrev, BackLink } from "../../components/nav/Navigation.jsx";
import { ArticleHeader, Prose, KeyTakeaways, Figure, Callout, PullQuote, DataNote } from "../../components/content/Prose.jsx";
import { StackedAreaChart } from "../../components/data/StackedAreaChart.jsx";
import { ScatterChart } from "../../components/data/Charts.jsx";
import { SCATTER, GERMANY, CHAPTERS } from "./data.js";

export function Story({ onNavigate, mark = "../../assets/gorilla-dark.svg" }) {
  const [active, setActive] = React.useState("money");
  return (
    <div className="gg-page" style={{ background: "var(--bg-page)", minHeight: "100vh" }}>
      <TopNav active="Story" mark={mark} onNavigate={onNavigate} />

      <div style={{ padding: "var(--band-y) var(--gutter) 0" }}>
        <BackLink onClick={(e) => { e.preventDefault(); onNavigate && onNavigate("Story"); }}>All chapters</BackLink>
      </div>

      <div className="gg-article" style={{
        display: "grid", gridTemplateColumns: "220px minmax(0, 1fr)",
        gap: "var(--space-11)", padding: "var(--space-8) var(--gutter) var(--space-10)",
        alignItems: "start",
      }}>
        <TableOfContents items={CHAPTERS} active={active} onSelect={setActive} style={{ position: "sticky", top: "var(--space-8)" }} />

        <div>
          <ArticleHeader
            chapter="Chapter 03" kicker="The energy story" readingTime="8 min read"
            updated="August 2026" byline="Grid Gorilla"
            title="Germany spent €500bn and still burns coal"
            standfirst="The Energiewende is the most expensive energy experiment ever run. Here is what it actually bought — and what it did not."
          />

          <div style={{ marginTop: "var(--space-10)" }}>
            <Prose>
              <KeyTakeaways items={[
                "Renewables went from 6% to 38% of German generation in twenty-five years.",
                "Nuclear closed faster than coal, so emissions fell slower than capacity grew.",
                "France still runs a cleaner grid, at roughly a tenth of the subsidy cost.",
              ]} />

              <p className="lede">In 2000 Germany passed a law that would reshape the European power market — and, indirectly, the price of every solar panel on Earth.</p>

              <p>The Renewable Energy Sources Act guaranteed anyone generating clean electricity a fixed price for twenty years. It worked, in the narrow sense that it was designed to: wind and solar now supply <span className="num">38%</span> of German power, up from almost nothing.</p>

              <h2>What the money actually bought</h2>

              <p>The honest summary is that Germany bought a global industry rather than a national outcome. Panel costs fell <span className="num">89%</span> across the period, and German households paid a large share of the learning curve that made solar the cheapest electricity in history.</p>

              <Figure source="Ember · IEA, 2026" caption="German generation mix, 1990–2026. The band that disappears in 2023 is nuclear.">
                <StackedAreaChart series={GERMANY} years={[1990, 2000, 2010, 2026]} height={240} />
              </Figure>

              <Callout label="How we calculated this">
                Costs are cumulative EEG surcharges expressed in 2026 euros, excluding grid expansion — which is now the larger number.
              </Callout>

              <PullQuote attribution="Chapter 3 of 8">Nuclear closed faster than coal, and the atmosphere noticed.</PullQuote>

              <h2>Why this matters beyond Germany</h2>

              <p>Electricity per person tracks almost every measure of human development, which is why the transition is not simply an emissions question. The relationship is strong and it flattens out — but nobody has ever built a rich country on a small grid.</p>

              <Figure source="Ember · World Bank, 2026" caption="Electricity per person against Human Development Index, 168 countries. Log scale.">
                <ScatterChart logX highlight="Ireland" points={SCATTER} height={280}
                  xLabel="kWh per person" yLabel="Human Development Index" yMax={1} xMax={60000} />
              </Figure>

              <Callout label="One caveat" tone="caution">
                This is a correlation, and a well-studied one. Electricity enables development and development drives demand — the arrow runs both ways, and the flat top-right suggests the returns to more power diminish sharply.
              </Callout>

              <h3>What to watch next</h3>
              <ul>
                <li>The coal exit is legislated for 2038, with real pressure to move it to 2030.</li>
                <li>Grid expansion, not generation, is now the binding constraint.</li>
                <li>Whether the nuclear decision gets revisited — politically unlikely, technically trivial.</li>
              </ul>

              <DataNote
                sources={["Ember", "IEA", "Destatis", "World Bank"]}
                method="Generation shares are calendar-year, not rolling twelve months."
                caveat="Imported electricity is attributed to the exporting grid, which flatters import-heavy years."
                updated="June 2026"
              />
            </Prose>
          </div>

          <NextPrev style={{ marginTop: "var(--space-11)" }}
            prev={{ label: "Chernobyl, and the fleet that never got built" }}
            next={{ label: "The fracking decade" }} />
        </div>
      </div>

      <SiteFooter mark={mark} />
    </div>
  );
}
