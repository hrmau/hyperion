`MixBar` is the one-line version of the mix chart — the sparkline of fuel share.

```jsx
<MixBar series={{ wind:34, solar:4, gas:42, coal:6, other:14 }} height={12} />
```

Use inside `DataTable` rows and country cards. Below 10px tall drop the `gap` to 0 — the separators stop helping.
