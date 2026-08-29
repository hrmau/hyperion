`FuelLegend` pairs with every fuel-coloured chart. Swatch = exact band fill, label = neutral.

```jsx
<FuelLegend shares={[{fuel:'wind',value:34},{fuel:'solar',value:4},{fuel:'gas',value:42},{fuel:'coal',value:6},{fuel:'other',value:14}]} />
```

Do NOT colour the label text — the tamed ramp puts gas, hydro and other within a few values of each other and coloured text becomes unreadable. Use `layout="column"` beside a tall chart.
