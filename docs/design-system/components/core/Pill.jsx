import React from "react";

/* The filter pill. Used for the "REDRAW FOR" row (World / EU / China / …)
   and any other single-select taxonomy. Selected = inverse fill. */
export function Pill({ children, selected = false, dashed = false, onClick, style, ...rest }) {
  return (
    <button
      onClick={onClick}
      aria-pressed={selected}
      style={{
        fontFamily: "var(--font-sans)", fontSize: "var(--fs-ui)",
        fontWeight: "var(--fw-medium)", padding: "7px 14px",
        borderRadius: "var(--r-pill)", cursor: "pointer",
        background: selected ? "var(--bg-inverse)" : "transparent",
        color: selected ? "var(--text-on-inverse)" : dashed ? "var(--text-secondary)" : "var(--text-primary)",
        border: selected ? "1px solid transparent"
          : `1px ${dashed ? "dashed" : "solid"} var(--line-strong)`,
        transition: "all var(--dur-fast) var(--ease-out)",
        ...style,
      }}
      {...rest}
    >
      {children}
    </button>
  );
}
