import React from "react";

/* The gorilla's reading. Every chart in the product is followed by one
   plain-English sentence explaining what to look at. Mark is 24px, text is
   15px, the lead clause is green. This is the brand's voice made visible —
   do not use it for generic captions. */
export function GorillaNote({ lead, children, mark = "assets/gorilla-dark.svg", divider = true, style, ...rest }) {
  return (
    <div style={{
      display: "flex", alignItems: "flex-start", gap: "var(--space-5)",
      marginTop: "var(--space-8)",
      paddingTop: divider ? "var(--space-7)" : 0,
      borderTop: divider ? "1px solid var(--border-default)" : undefined,
      ...style,
    }} {...rest}>
      <img src={mark} alt="" style={{ width: 24, flex: "none", marginTop: 2 }} />
      <div style={{ fontSize: "var(--fs-body)", lineHeight: 1.55, color: "var(--text-secondary)" }}>
        {lead && <strong style={{ color: "var(--green)", fontWeight: "var(--fw-bold)" }}>{lead} </strong>}
        {children}
      </div>
    </div>
  );
}
