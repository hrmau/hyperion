`Pill` is the filter chip for switching the dataset a chart is drawn from.

```jsx
<Pill selected>World</Pill>
<Pill>European Union</Pill>
<Pill dashed>+ any of 214</Pill>
```

Lay pills out in a `flex` row with `gap: var(--space-4)`, `flex-wrap: wrap` and `className="gg-scroll-row"` so it scrolls rather than wrapping to a third line on narrow screens.
