`RankedBarList` shows a spread — who is top, who is bottom, and how brutal the gap is.

```jsx
<RankedBarList showRank items={[
  { label:"Iceland", value:52300, display:"52,300", tone:"accent" },
  { label:"Norway",  value:23000, display:"23,000" },
  { label:"Nigeria", value:160,   display:"160", tone:"down" },
]} />
```

Tint one row at most. When the spread is extreme (327×) say so in a `GorillaNote` underneath rather than switching to a log scale silently.
