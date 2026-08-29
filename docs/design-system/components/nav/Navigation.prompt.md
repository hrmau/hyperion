Navigation beyond the five global destinations.

```jsx
<Tabs items={[{value:"mix",label:"Mix",count:8},{value:"rank",label:"Rankings"},{value:"src",label:"Sources"}]} active={tab} onChange={setTab} />
<SegmentedControl options={["Share", "Absolute"]} value={mode} onChange={setMode} />
<Breadcrumbs items={[{label:"Explore",href:"/explore"},{label:"Europe"},{label:"Ireland"}]} />
<TableOfContents items={chapters} active={current} />
<Pagination page={3} pages={22} onChange={setPage} />
<NextPrev prev={{label:"Chernobyl"}} next={{label:"The fracking decade"}} />
```

**Tabs change the view; Pills change the dataset.** Never use a pill row to switch sections or a tab row to switch countries — that distinction is load-bearing.

Put `SkipLink` first in every page. Breadcrumbs only once nesting is real (country under continent, chapter under Story) — not on top-level pages.
