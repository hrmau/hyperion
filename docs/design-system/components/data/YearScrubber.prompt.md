`YearScrubber` moves the hero chart through time.

```jsx
<YearScrubber years={[1985,1990,1995,2000,2005,2010,2015,2020,2026]} value={year} onChange={setYear} />
```

The four readout stats below it MUST recompute from the selected year — the reference design's one hard rule. On mobile show first/mid/last labels only.
