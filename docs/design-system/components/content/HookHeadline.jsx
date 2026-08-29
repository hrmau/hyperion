import React from "react";

/* The geolocated hook. Two facts about the visitor's own grid held in
   tension, with the measured figure tinted to its fuel band. This is the
   most important text in the product — see the prompt for the templates. */
export function HookHeadline({ children, lead, highlight, highlightTone = "var(--fuel-gas-ink)", tail, style, ...rest }) {
  return (
    <h1 style={{
      margin: 0, fontSize: "var(--fs-hero)", fontWeight: "var(--fw-bold)",
      lineHeight: "var(--lh-hero)", letterSpacing: "var(--ls-hero)",
      maxWidth: "var(--maxw-hero)", textWrap: "pretty", ...style,
    }} {...rest}>
      {children ?? (<>
        {lead}{highlight && <span style={{ color: highlightTone }}> {highlight} </span>}{tail}
      </>)}
    </h1>
  );
}
