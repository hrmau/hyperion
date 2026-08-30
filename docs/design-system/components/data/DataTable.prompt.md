`DataTable` is the Rankings surface. Hairlines only — no stripes, no borders between columns.

```jsx
<DataTable
  highlightRow="IE"
  columns={[
    { key:"rank", label:"#", mono:true, width:48 },
    { key:"country", label:"Country" },
    { key:"mix", label:"Mix", render:(r)=> <MixBar series={r.series} height={10} /> },
    { key:"clean", label:"Clean %", mono:true, align:"right" },
  ]}
  rows={rows}
/>
```

Mark every column except the first two and one headline metric as `mobileOptional` — the responsive layer drops them below 768px. Never horizontally scroll a table on a phone.
