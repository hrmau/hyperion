`DonutStat` is for one share you want read as a gauge.

```jsx
<DonutStat value={40.9} label="Clean" />
<DonutStat value={56.4} label="Fossil" color="var(--fuel-gas)" track="var(--ink-700)" />
```

The inner disc must match the surface behind it — pass a matching background if the donut sits on a card rather than the page.
