import * as React from "react";

/** Periodic-table view of all 214 grids — one tile per country, grouped by
 *  continent, coloured by dominant fuel (categorical) or a measure
 *  (`scaleColor` from fuels.js). Hover reveals a white outline; never a
 *  colour change.
 *
 * @startingPoint section="Charts" subtitle="Country tile grid, coloured by fuel" viewport="700x300"
 */
export interface TileGridProps extends React.HTMLAttributes<HTMLDivElement> {
  groups: Array<{
    label: string;
    tiles: Array<{
      code: string;
      color: string;
      /** Override the on-fill ink. Defaults to onFill(color) from fuels.js —
       *  the light half of the ramp needs dark ink, so never assume --paper. */
      ink?: string;
      title?: string;
    }>;
  }>;
  /** Desktop size only — the responsive layer forces 48px under 1024px and
   *  44px under 768px. */
  tileSize?: number;
  gap?: number;
  onSelect?: (tile: { code: string }) => void;
}
export function TileGrid(props: TileGridProps): JSX.Element;
