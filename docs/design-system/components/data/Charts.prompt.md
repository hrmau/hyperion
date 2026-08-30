Chart types beyond the stacked area. All hand-rolled SVG — no chart library.

```jsx
<LineChart ticks={[1990,2000,2010,2026]} series={[
  { label:"Ireland", values:[0,2,12,34], color:"var(--green)", emphasis:true },
  { label:"Denmark", values:[2,12,24,55], color:"var(--sage-deep)" },
]} />

<ScatterChart logX highlight="Ireland" xLabel="kWh per person" yLabel="Human Development Index"
  points={countries} />

<DiffBar label="Clean share" left={41} right={56} leftLabel="Ireland" rightLabel="UK" />
```

Choosing: composition over time → `StackedAreaChart` · levels over time → `LineChart` (max 4 series) · ranking countries → `RankedBarList` · two countries → `DiffBar` · relationships → `ScatterChart`.

The scatter is the one that carries the product's argument about electricity and development — always give it axis titles, usually `logX` (the per-capita spread is 327×), and always put a sentence near it saying correlation is not causation.
