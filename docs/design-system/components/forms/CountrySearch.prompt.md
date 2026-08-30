`CountrySearch` is how most readers will actually navigate — put it in reach on every data page.

```jsx
<CountrySearch
  autoFocus
  countries={[{ code:"IE", name:"Ireland", fuel:"Gas", color:"var(--fuel-gas)" }]}
  onSelect={(c) => go(`/country/${c.code}`)}
/>
```

Rules: never require a minimum length beyond one character; match on name *and* ISO code (journalists paste codes); show the dominant-fuel swatch so the list reinforces the colour scale; and always render an empty result as a sentence, never a blank dropdown.
