Form controls for filters, settings and any data entry.

```jsx
import { Field, Input, Select, Checkbox, Radio, Switch, RangeSlider, Fieldset } from "./components/forms/Forms.jsx";

<Field label="Country" hint="Type at least two letters">
  <Input placeholder="Search 214 grids" iconLeft="⌕" />
</Field>

<Field label="Measure">
  <Select options={["Clean %", "Per person", "Total output"]} />
</Field>

<Fieldset legend="Include">
  <Checkbox checked label="Renewables" hint="Wind, solar, hydro, bioenergy" />
  <Checkbox label="Nuclear" />
</Fieldset>

<Switch checked label="Show per-capita figures" onChange={setPerCapita} />
<RangeSlider min={1985} max={2026} value={year} onChange={setYear} showValue />
```

Rules:
- **Always wrap in `Field`.** A bare input with no mono label is not part of this system.
- **44px minimum height** on every control, at every breakpoint. `Switch` puts its
  label inside the button so the whole row is the target; `Checkbox`/`Radio` use a
  real `<input>` inside a `<label>`, which is why their wrapper works.
- **Errors use `error`, not colour alone** — the message is the affordance, clay is the reinforcement.
- **Green means checked, and only checked.** Never use green for a focus ring on a filled control or for a "valid" state.
- Prefer `Pill` over `Radio` for 2–5 short mutually exclusive filters that redraw a chart; use `Radio` when the choice is a form answer rather than a view switch.
- Prefer `Select` once options pass six.
