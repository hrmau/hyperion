Layered surfaces. Flat ink scrim, never a blur — blur wrecks chart colours behind the panel.

```jsx
<Modal open={open} onClose={close} eyebrow="Change location" title="Which grid are you interested in?"
  footer={<Button variant="primary" onClick={close}>Done</Button>}>
  <CountrySearch autoFocus countries={COUNTRIES} onSelect={pick} />
</Modal>

<Drawer open={filters} onClose={close} side="bottom" title="Filters">…</Drawer>

<div style={{ position: "relative" }}>
  <Popover open={menu} onClose={close}>
    <MenuItem selected meta="214">All countries</MenuItem>
    <MenuItem meta="27">European Union</MenuItem>
  </Popover>
</div>
```

Choose by intent: **Modal** for one focused decision · **Drawer** for detail the reader wants beside the chart (bottom sheet for mobile filters) · **Popover** for a short list of choices. Escape closes all three.
