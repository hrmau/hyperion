`TileGrid` is the whole dataset as the layout — 214 country tiles, coloured by what actually keeps the lights on.

```jsx
import { FUELS, scaleColor } from "./fuels.js";
<TileGrid groups={[{ label:"Europe", tiles:[{code:"NO",color:FUELS.hydro.color},{code:"FR",color:FUELS.nuclear.color}] }]} />
```

Tile labels get their ink from `onFill(color)` automatically — the ramp crosses from dark slate to light sage, so half the tiles need dark text. Override per tile with `ink` only if you are using a fill outside the token set.

Pair with a `FuelLegend` in a right rail that also carries the count per fuel. On mobile drop `tileSize` to 44 and let continents stack.
