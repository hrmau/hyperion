import React from "react";

/* Rankings table. Mono numerals, hairline rows, no zebra striping, no
   vertical rules. Numeric columns are right-aligned and tabular. */
export function DataTable({ columns, rows, highlightRow, onRowClick, style, ...rest }) {
  return (
    <table style={{ width: "100%", borderCollapse: "collapse", ...style }} {...rest}>
      <thead>
        <tr>
          {columns.map((c) => (
            <th key={c.key} className={c.mobileOptional ? "gg-col-optional" : undefined} style={{
              textAlign: c.align ?? "left", padding: "0 var(--space-5) var(--space-3)",
              fontFamily: "var(--font-mono)", fontSize: "var(--fs-mono-xxs)",
              fontWeight: "var(--fw-medium)", letterSpacing: "var(--ls-label)",
              textTransform: "uppercase", color: "var(--text-label)",
              borderBottom: "1px solid var(--border-emphasis)", whiteSpace: "nowrap",
              width: c.width,
            }}>{c.label}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, i) => {
          const on = highlightRow != null && (row.id ?? i) === highlightRow;
          return (
            <tr key={row.id ?? i} onClick={onRowClick && (() => onRowClick(row))}
              style={{
                background: on ? "var(--green-wash)" : "transparent",
                cursor: onRowClick ? "pointer" : undefined,
              }}>
              {columns.map((c) => (
                <td key={c.key} className={c.mobileOptional ? "gg-col-optional" : undefined} style={{
                  textAlign: c.align ?? "left", padding: "var(--space-5)",
                  borderBottom: "1px solid var(--border-default)",
                  fontFamily: c.mono ? "var(--font-mono)" : "var(--font-sans)",
                  fontVariantNumeric: c.mono ? "tabular-nums" : undefined,
                  fontSize: c.mono ? "var(--fs-mono-sm)" : "var(--fs-body-sm)",
                  color: on && c.key === columns[0].key ? "var(--green)" : "var(--text-primary)",
                }}>{c.render ? c.render(row) : row[c.key]}</td>
              ))}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
