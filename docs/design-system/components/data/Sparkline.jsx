import React from "react";

/* Tiny trend line for table rows and stat blocks. One series, one colour,
   no axes, no fill. */
export function Sparkline({ values, width = 88, height = 22, color = "var(--paper-a55)", strokeWidth = 1.5, style, ...rest }) {
  const min = Math.min(...values), max = Math.max(...values);
  const span = max - min || 1;
  const pts = values.map((v, i) => `${(i / (values.length - 1)) * width},${height - ((v - min) / span) * height}`).join(" ");
  return (
    <svg viewBox={`0 0 ${width} ${height}`} style={{ width, height, overflow: "visible", ...style }} {...rest}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth={strokeWidth} vectorEffect="non-scaling-stroke" />
    </svg>
  );
}
