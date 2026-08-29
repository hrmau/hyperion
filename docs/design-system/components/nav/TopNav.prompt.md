`TopNav` is the single global nav. Never add a sixth destination without removing one.

```jsx
<TopNav active="Explore" location="Ireland" meta="214 countries · 1985 → 2026" />
```

Active item = 12% white well, never green. Use `meta` on world-scoped pages and `location` on geolocated ones — showing both crowds the right edge below 1100px.
