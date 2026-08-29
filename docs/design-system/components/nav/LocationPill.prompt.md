`LocationPill` is the contract with the visitor: we guessed your country, here's how to correct us.

```jsx
<LocationPill country="Ireland" onChange={openCountryPicker} />
```

Never render geolocated copy without it. If detection fails, fall back to the world view — do not show an empty pill.
