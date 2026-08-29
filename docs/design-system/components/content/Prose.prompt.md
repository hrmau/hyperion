Long-form content. Wrap the body in `Prose` and write plain HTML — `tokens/prose.css` styles elements, so no classes are needed.

```jsx
<ArticleHeader chapter="Chapter 03" kicker="The energy story" readingTime="8 min read"
  updated="August 2026" byline="Grid Gorilla"
  title="Germany spent €500bn and still burns coal"
  standfirst="The Energiewende is the most expensive energy experiment ever run. Here is what it actually bought." />

<Prose>
  <p className="lede">In 2000 Germany passed a law…</p>
  <p>Wind and solar now supply <span className="num">38%</span> of German power.</p>
  <h2>What the money bought</h2>
  <Figure source="Ember, 2026" caption="German generation mix, 1990–2026.">
    <StackedAreaChart series={DE} years={[1990,2000,2010,2026]} />
  </Figure>
  <Callout label="How we calculated this">Costs are cumulative EEG surcharges in 2026 euros.</Callout>
  <PullQuote attribution="Chapter 3 of 8">Nuclear closed faster than coal.</PullQuote>
</Prose>

<DataNote sources={["Ember", "IEA", "Destatis"]}
  method="Generation shares are calendar-year, not rolling."
  caveat="Imported electricity is attributed to the exporting grid."
  updated="June 2026" />
```

Rules: `KeyTakeaways` near the top of anything over ~800 words; every chart inside prose is a `Figure` **with a source**; every page carrying figures ends in a `DataNote` that includes a real caveat. Numbers in running text get `className="num"` so they set in mono.
