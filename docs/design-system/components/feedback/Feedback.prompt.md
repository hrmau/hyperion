Status and non-data states. Most notices here are about the *data*, not the app.

```jsx
<Banner tone="caution" label="Data vintage">
  Nigeria's 2026 figures are provisional — the last audited year is 2024.
</Banner>

<Tooltip label="52,300 kWh"><span>Iceland</span></Tooltip>
<DefinedTerm term="capacity factor" definition="Actual output ÷ theoretical maximum" />

<EmptyState label="No results" title="No grid matches “Wakanda”."
  action={<Button variant="secondary">Clear search</Button>}>
  Try an ISO code, or browse the full rankings.
</EmptyState>

<ChartSkeleton height={210} />
<ProgressBar value={4} max={10} label="Round" />
```

Rules: skeletons never shimmer; a loading placeholder is the same height as the thing it replaces; errors state what failed and offer a retry; toasts go bottom-left and never carry a decision. Write copy as a sentence with a full stop.
