`CountryHeader` opens every Explore / country page.

```jsx
<CountryHeader country="Ireland" stats={[
  { label:"Wind share", value:"34%", note:"2nd of 214", tone:"accent" },
  { label:"Clean share", value:"41%", note:"exactly the world average" },
  { label:"Per person", value:"6,100", note:"kWh · 42nd of 214" },
]}>
  Second in the world for wind, and still burning gas for 42% of its power.
</CountryHeader>
```

Every stat carries a rank or a comparison in `note` — a bare number tells the reader nothing.
