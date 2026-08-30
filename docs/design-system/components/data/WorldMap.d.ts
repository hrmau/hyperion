import * as React from "react";

/**
 * Choropleth over REAL Natural Earth geometry — country outlines are never
 * drawn by hand. Topology is fetched from the pinned world-atlas build and
 * projected with d3-geo.
 *
 * **Host page requirement.** These exact pinned, hash-verified tags must be in
 * `<head>`; they fail closed if tampered with, so never change the versions,
 * URLs or hashes:
 *
 * ```html
 * <script src="https://unpkg.com/d3@7.9.0/dist/d3.min.js"
 *   integrity="sha384-CjloA8y00+1SDAUkjs099PVfnY2KmDC2BZnws9kh8D/lX1s46w6EPhpXdqMfjK6i"
 *   crossorigin="anonymous"></script>
 * <script src="https://unpkg.com/topojson-client@3.1.0/dist/topojson-client.min.js"
 *   integrity="sha384-Ukv1p/xTma6P4/2bY5KzWBw+ydSpXmhCMtyciIQVDJ1RmOxtCYNMF1uXT9T63H67"
 *   crossorigin="anonymous"></script>
 * ```
 *
 * Natural Earth is the default projection on purpose: Mercator inflates
 * high-latitude grids, and Iceland, Norway and Canada top the clean-energy
 * table — the map must not exaggerate them.
 *
 * @startingPoint section="Charts" subtitle="World choropleth, real geometry" viewport="960x520"
 */
export interface WorldMapProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Keyed by numeric ISO 3166-1 country id (the world-atlas `id`).
   *  `mode="scale"` expects numbers; `mode="fuel"` expects a fuel key. */
  values?: Record<string, number | string>;
  mode?: "scale" | "fuel";
  min?: number;
  max?: number;
  height?: number;
  /** naturalEarth for the world; mercator only when zoomed to one region. */
  projection?: "naturalEarth" | "mercator";
  selected?: string | number;
  onSelect?: (feature: { id: string; name: string }) => void;
  onHover?: (feature: { id: string; name: string } | null) => void;
  /** Countries with no figure. Must be visually distinct from the low end of
   *  the scale — absence of data is not zero. */
  noDataFill?: string;
}
export function WorldMap(props: WorldMapProps): JSX.Element;

export interface MapLegendProps extends React.HTMLAttributes<HTMLDivElement> {
  label?: string;
  min?: string;
  max?: string;
  mode?: "scale" | "fuel";
  noData?: boolean;
}
export function MapLegend(props: MapLegendProps): JSX.Element;
