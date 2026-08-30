import React from "react";
import { Input } from "./Forms.jsx";
import { Badge } from "../core/Badge.jsx";

/* The product's primary navigation device: find one of 214 grids. Typeahead
   over a flat list, mono ISO code on the left, dominant-fuel swatch on the
   right. Keyboard-first — arrow keys and Enter, because journalists live on
   the keyboard and this is faster than any map. */
export function CountrySearch({
  countries = [], onSelect, placeholder = "Search 214 grids",
  autoFocus = false, limit = 7, emptyLabel = "No grid matches that name.",
  style, ...rest
}) {
  const [query, setQuery] = React.useState("");
  const [active, setActive] = React.useState(0);
  const q = query.trim().toLowerCase();
  const results = q.length === 0 ? [] : countries
    .filter((c) => c.name.toLowerCase().includes(q) || c.code.toLowerCase() === q)
    .slice(0, limit);

  const commit = (c) => { if (c) { onSelect && onSelect(c); setQuery(""); } };
  const onKeyDown = (e) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setActive((i) => Math.min(i + 1, results.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActive((i) => Math.max(i - 1, 0)); }
    else if (e.key === "Enter") { e.preventDefault(); commit(results[active]); }
    else if (e.key === "Escape") { setQuery(""); }
  };

  return (
    <div style={{ position: "relative", ...style }} {...rest}>
      <Input
        value={query} autoFocus={autoFocus} placeholder={placeholder} iconLeft="⌕"
        role="combobox" aria-expanded={results.length > 0} aria-autocomplete="list"
        onChange={(e) => { setQuery(e.target.value); setActive(0); }}
        onKeyDown={onKeyDown}
      />
      {q.length > 0 && (
        <div role="listbox" style={{
          position: "absolute", top: "calc(100% + 6px)", left: 0, right: 0, zIndex: 30,
          background: "var(--ink-700)", border: "1px solid var(--line-strong)",
          borderRadius: "var(--r-button)", overflow: "hidden",
        }}>
          {results.length === 0 ? (
            <div style={{ padding: "14px", fontSize: "var(--fs-body-sm)", color: "var(--text-tertiary)" }}>{emptyLabel}</div>
          ) : results.map((c, i) => (
            <button key={c.code} role="option" aria-selected={i === active}
              onMouseEnter={() => setActive(i)} onClick={() => commit(c)}
              style={{
                display: "flex", alignItems: "center", gap: "var(--space-5)", width: "100%",
                padding: "11px 14px", minHeight: 44, border: "none", cursor: "pointer",
                textAlign: "left", fontFamily: "var(--font-sans)", fontSize: "var(--fs-body)",
                color: "var(--paper)",
                background: i === active ? "var(--ink-600)" : "transparent",
                borderTop: i === 0 ? "none" : "1px solid var(--line-soft)",
              }}>
              <span style={{
                fontFamily: "var(--font-mono)", fontSize: "var(--fs-mono-sm)",
                color: "var(--text-tertiary)", width: 26, flex: "none",
              }}>{c.code}</span>
              <span style={{ flex: 1 }}>{c.name}</span>
              {c.fuel && <Badge tone="outline">{c.fuel}</Badge>}
              {c.color && <span style={{ width: 10, height: 10, flex: "none", background: c.color }} />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
