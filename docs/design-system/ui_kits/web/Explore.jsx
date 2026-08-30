import React from "react";
import { TopNav } from "../../components/nav/TopNav.jsx";
import { SiteFooter } from "../../components/nav/SiteFooter.jsx";
import { SegmentedControl } from "../../components/nav/Navigation.jsx";
import { Eyebrow } from "../../components/core/Eyebrow.jsx";
import { GorillaNote } from "../../components/core/GorillaNote.jsx";
import { Banner } from "../../components/feedback/Feedback.jsx";
import { CountrySearch } from "../../components/forms/CountrySearch.jsx";
import { Select } from "../../components/forms/Forms.jsx";
import { WorldMap, MapLegend } from "../../components/data/WorldMap.jsx";
import { TileGrid } from "../../components/data/TileGrid.jsx";
import { FuelLegend } from "../../components/data/FuelLegend.jsx";
import { FUELS } from "../../components/data/fuels.js";
import { COUNTRY_LIST, CLEAN_BY_ISO, TILE_GROUPS, FUEL_COUNTS } from "./data.js";

const MEASURES = ["Clean share", "Per person", "Total output", "Wind share", "Solar share"];

/* The geographic entry point. Map first, because "where" is the question a
   map answers; the tile grid is offered as the equal-weight alternative for
   readers who care about small grids that a map hides. */
export function Explore({ onNavigate, mark = "../../assets/gorilla-dark.svg" }) {
  const [view, setView] = React.useState("Map");
  const [measure, setMeasure] = React.useState("Clean share");
  const [hovered, setHovered] = React.useState(null);

  return (
    <div className="gg-page" style={{ background: "var(--bg-page)", minHeight: "100vh" }}>
      <TopNav active="Explore" meta="214 countries · dominant fuel" mark={mark} onNavigate={onNavigate} />

      <div style={{ padding: "var(--band-y) var(--gutter) var(--space-8)" }}>
        <Eyebrow style={{ marginBottom: "var(--space-6)" }}>Explore · all grids</Eyebrow>
        <div style={{ display: "flex", alignItems: "flex-end", gap: "var(--space-9)", flexWrap: "wrap" }}>
          <h1 style={{
            margin: 0, flex: "1 1 340px", fontSize: "var(--fs-h2)", fontWeight: "var(--fw-bold)",
            letterSpacing: "var(--ls-h2)", maxWidth: "22ch",
          }}>Every country on Earth, coloured by what keeps its lights on.</h1>
          <div style={{ flex: "0 1 300px", minWidth: 240 }}>
            <CountrySearch countries={COUNTRY_LIST} onSelect={() => onNavigate && onNavigate("Country")} />
          </div>
        </div>
      </div>

      <div style={{
        display: "flex", alignItems: "center", gap: "var(--space-6)", flexWrap: "wrap",
        padding: "var(--space-6) var(--gutter)",
        borderTop: "1px solid var(--border-default)", borderBottom: "1px solid var(--border-default)",
      }}>
        <SegmentedControl options={["Map", "Tiles"]} value={view} onChange={setView} />
        <div style={{ minWidth: 200 }}>
          <Select value={measure} onChange={(e) => setMeasure(e.target.value)} options={MEASURES} />
        </div>
        <span style={{
          marginLeft: "auto", fontFamily: "var(--font-mono)", fontSize: "var(--fs-mono-xs)",
          color: hovered ? "var(--paper)" : "var(--text-quiet)", textTransform: "uppercase", letterSpacing: "0.08em",
        }}>{hovered ? hovered.name : "Hover a country"}</span>
      </div>

      <div style={{ padding: "var(--space-8) var(--gutter) var(--space-10)" }}>
        {view === "Map" ? (
          <>
            <WorldMap mode="scale" min={0} max={100} values={CLEAN_BY_ISO} height={440} onHover={setHovered}
              onSelect={() => onNavigate && onNavigate("Country")} />
            <MapLegend label={measure} min="0%" max="100%" style={{ marginTop: "var(--space-6)" }} />
            <Banner label="Read the map carefully" style={{ marginTop: "var(--space-8)", maxWidth: "72ch" }}>
              Area is land, not electricity. Singapore and Iceland are almost invisible here and both matter —
              switch to Tiles to give every grid equal weight.
            </Banner>
          </>
        ) : (
          <div className="gg-explore-split" style={{ display: "grid", gridTemplateColumns: "1fr 236px", gap: "var(--space-9)" }}>
            <TileGrid groups={TILE_GROUPS} onSelect={() => onNavigate && onNavigate("Country")} />
            <div>
              <Eyebrow style={{ marginBottom: "var(--space-5)" }}>Key — all 214</Eyebrow>
              <FuelLegend layout="column" shares={FUEL_COUNTS} />
              <GorillaNote lead="Hydro is the quiet giant." mark={mark}>
                It powers more nations than anything except coal — it just does it in countries nobody writes about.
              </GorillaNote>
            </div>
          </div>
        )}
      </div>

      <SiteFooter mark={mark} />
    </div>
  );
}
