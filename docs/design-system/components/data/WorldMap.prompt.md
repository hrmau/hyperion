`WorldMap` is the geographic view of the dataset. Real Natural Earth geometry, never hand-drawn outlines.

Add the two pinned script tags (see the `.d.ts`) to the page `<head>`, then:

```jsx
<WorldMap
  mode="scale" min={0} max={100}
  values={{ "372": 41, "352": 99.9, "250": 92 }}   /* numeric ISO ids */
  selected="372"
  onSelect={(c) => go(c.id)}
/>
<MapLegend label="Clean share" min="0%" max="100%" />
```

Rules:
- **Natural Earth projection for the world.** Mercator inflates exactly the high-latitude countries that top the clean rankings — only use it zoomed into one region.
- **No-data is not zero.** It gets `--ink-700`, distinct from the bottom of the scale, and its own legend entry.
- **A map is not always the right answer.** For "who is top", a `RankedBarList` or `DataTable` is faster to read — the map is for *where*, not *how much*. `TileGrid` is the honest alternative when every country should get equal visual weight regardless of land area.
- Keys are the numeric ISO 3166-1 ids used by world-atlas, not two-letter codes — map your data before passing it in.
