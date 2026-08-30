`StackedAreaChart` is the product's hero chart — a country's or the world's fuel mix as one shape.

```jsx
<StackedAreaChart
  series={{ wind:[0,2,12,34], solar:[0,0,1,4], gas:[8,22,38,42], coal:[62,44,22,6], other:[30,32,27,14] }}
  years={[1990, 2000, 2010, 2026]}
  scrubYear={2026}
/>
```

Always pair with `FuelLegend` below and a `GorillaNote` under that. As a full-bleed hero background, set `height={520}`, place it absolutely, and lay a `linear-gradient(100deg, page 0%, page 84% 26%, transparent 68%)` scrim over it so headline text stays legible.
