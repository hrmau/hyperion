Use `Button` for every action; it is the only control that may carry an inverse or green fill.

```jsx
<Button variant="primary" size="lg">See Ireland's full profile</Button>
<Button variant="secondary" size="lg">Compare with the UK</Button>
```

Variants: `primary` (near-white fill, dark text — one per view), `secondary` (transparent + hairline, sits beside a primary), `accent` (brand green, reserved for the quiz/story CTA), `onAccent` (dark fill for use inside a green card), `ghost` (bare text). Sizes `sm | md | lg`. Wrap a pair of buttons in `className="gg-action-row"` — the responsive layer stacks them full-width below 768px.
