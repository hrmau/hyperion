`Stat` is the readout unit — mono label, tight-tracked number, quiet note.

```jsx
<Stat label="Wind share" value="34%" note="2nd of 214" tone="accent" size="lg" />
<Stat label="Total output" value="30,856" unit="TWh" note="3.2× larger than 1985" />
```

Lay 3–4 in a `flex` row with `gap: var(--space-9)` between hairline rules. On mobile use a 2-column grid; never shrink the number below 26px.
