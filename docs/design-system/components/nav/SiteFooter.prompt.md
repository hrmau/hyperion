`SiteFooter` closes every content and data page. Provenance is the point — not decoration.

```jsx
<SiteFooter
  sources={[
    { name: "Ember", detail: "Electricity generation, 2000–2026" },
    { name: "IEA", detail: "Historic series, 1985–1999" },
  ]}
  vintage="Data through June 2026"
/>
```

Three bands, each divided by a hairline: brand + link columns → sources with vintages → licence and privacy note. Collapses to one column below 768px via `gg-footer-grid`.

No newsletter signup, no social icons, no repeated logo lockup, no "back to top" — the page is not long enough to need one, and the nav is fixed on mobile.
