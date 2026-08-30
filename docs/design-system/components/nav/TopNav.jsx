import React from "react";
import { LocationPill } from "./LocationPill.jsx";

const ITEMS = ["Explore", "Play", "Compare", "Rankings", "Story"];

export function TopNav({
  items = ITEMS, active = "Explore", onNavigate,
  wordmark = "Grid Gorilla", mark = "assets/gorilla-dark.svg",
  meta, location, onChangeLocation, bordered = true, style, ...rest
}) {
  return (
    <nav className="gg-nav" style={{
      display: "flex", alignItems: "center", gap: "var(--space-8)",
      padding: "18px var(--gutter)",
      borderBottom: bordered ? "1px solid var(--border-default)" : undefined,
      ...style,
    }} {...rest}>
      <a href="/" style={{ display: "flex", alignItems: "center", gap: "var(--space-4)", color: "var(--text-primary)" }}>
        <img src={mark} alt="" style={{ width: 26 }} />
        <span style={{ fontSize: 17, fontWeight: "var(--fw-bold)", letterSpacing: "-0.015em" }}>{wordmark}</span>
      </a>
      <div className="gg-nav-items gg-scroll-row" style={{ display: "flex", gap: "var(--space-1)", marginLeft: "var(--space-6)" }}>
        {items.map((item) => {
          const on = item === active;
          return (
            <a key={item} href={"/" + item.toLowerCase()}
              onClick={onNavigate && ((e) => { e.preventDefault(); onNavigate(item); })}
              style={{
                padding: "7px 13px", borderRadius: "var(--r-well)",
                fontSize: "var(--fs-ui)", fontWeight: "var(--fw-medium)",
                background: on ? "rgba(238,242,242,0.12)" : "transparent",
                color: on ? "var(--text-primary)" : "var(--text-secondary)",
                transition: "all var(--dur-fast) var(--ease-out)",
              }}>{item}</a>
          );
        })}
      </div>
      <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "var(--space-5)" }}>
        {meta && <span className="gg-nav-meta" style={{ fontFamily: "var(--font-mono)", fontSize: "var(--fs-mono)", color: "var(--text-quiet)" }}>{meta}</span>}
        {location && <LocationPill country={location} onChange={onChangeLocation} />}
      </div>
    </nav>
  );
}
