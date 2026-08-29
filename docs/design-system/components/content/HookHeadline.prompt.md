`HookHeadline` is the single most important string in the product: a fact about the visitor's own grid that makes them want to look.

```jsx
<HookHeadline
  lead="Ireland burns gas for"
  highlight="42%"
  highlightTone="var(--fuel-gas-ink)"
  tail="of its power — and is second in the world for wind."
/>
```

**Four templates, in priority order.** Pick the first that fires for the detected country:

1. **Tension** — a fossil dependence AND a world-class clean rank. *"Ireland burns gas for 42% of its power — and is second in the world for wind."*
2. **Superlative** — a top-3 or bottom-3 rank on any measure. *"Nowhere on Earth runs cleaner than Iceland."*
3. **Scale** — an extreme per-capita or absolute figure. *"Nigeria has 200 million people and a grid the size of Ireland's."*
4. **Movement** — the fastest-changing band in the last decade. *"Vietnam built more solar in five years than the UK has ever built."*

Rules: never two percentages in one sentence unless they are in tension; the tinted figure must match its own fuel band, using the `*-ink` token (chart fills fail contrast as text); no exclamation marks; never address the country as "you" (the reader lives there, they are not the grid). If no template fires, fall back to the world hook — do not force a weak fact.
