'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import * as d3 from 'd3';
import * as topojson from 'topojson-client';
import type { Topology, GeometryCollection } from 'topojson-specification';
import type { CountriesData, Country, FossilFuelData } from '@/lib/types';
import type { MapColorMode } from '@/lib/colors';
import { createScaleForModeLatest, getCountryValueForModeLatest } from '@/lib/scales';
// Single source of truth, shared with scripts/generate-neighbours.js so the two
// cannot drift. Widened to a plain record: the JSON import narrows to its own
// literal keys, which is not what a runtime numeric id is.
import numericToIso3Json from '@/data/iso-numeric.json';

const numericToIso3: Record<string, string> = numericToIso3Json;

interface WorldMapProps {
  countries: CountriesData;
  selectedBloc: string;
  blocCountryIds: Set<string>;
  onHover: (country: Country | null, event: MouseEvent | null) => void;
  onClick: (country: Country | null) => void;
  selectedCountry: Country | null;
  mapMode: MapColorMode;
  fossilFuelData: FossilFuelData | null;
  /**
   * Frame the map on this country on arrival. Deliberately separate from
   * `selectedCountry`: clicking a country on the map must not move the
   * viewport under the reader, so only a deep link sets this.
   */
  focusIso3?: string | null;
}

// Zoom control button component
function ZoomButton({ onClick, disabled, children, title }: {
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
  title: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className="w-8 h-8 flex items-center justify-center bg-card border border-border rounded-md text-primary hover:bg-inset disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-sm font-medium"
    >
      {children}
    </button>
  );
}

// ISO 3166-1 numeric -> ISO3, covering every country present in BOTH the
// shipped geometry and countries-yearly.json. Regenerate after a data refresh:
// any country missing here renders as no-data grey and is not clickable, even
// when it has full generation records.
//
// Sized against world-50m.json. The 110m file drawn on first paint is a subset,
// so entries it does not carry simply never match while it is showing.
// Excluded deliberately: Antarctica and Fr. S. Antarctic Lands (no grid), and
// territories with no ISO numeric id in the source geometry.

function getIso3(featureId: string | number | undefined): string | undefined {
  if (featureId == null) return undefined;
  const numericId = featureId.toString().padStart(3, '0');
  return numericToIso3[numericId];
}

const MAP_WIDTH = 960;
const MAP_HEIGHT = 500;

const MIN_ZOOM = 1;
const MAX_ZOOM = 8;

/**
 * How many country-widths of context to keep in frame when focusing.
 *
 * 4 was chosen against the real projected geometry rather than by eye. It puts
 * Ireland at the 8x cap, which frames it with Britain and the top of France;
 * Kenya lands at 4.0x, Great Britain 5.0x, New Zealand 6.7x, the United States
 * 1.7x, and Russia and Brazil stay at 1x because they already fill the frame.
 */
const FOCUS_CONTEXT = 4;

/**
 * Projected bounds of a country's largest polygon.
 *
 * A plain `path.bounds(feature)` covers every island and overseas territory the
 * feature carries, which for framing purposes is the wrong answer — see the
 * focus effect for the numbers.
 */
/** Only what this needs from a GeoJSON feature; the union's other members have no `coordinates`. */
type BoundsFeature = { geometry?: { type: string; coordinates?: unknown } | null };

function mainlandBounds(
  feature: BoundsFeature,
  path: d3.GeoPath
): [[number, number], [number, number]] | null {
  const geometry = feature.geometry;
  if (!geometry) return null;
  if (geometry.type !== 'MultiPolygon' || !Array.isArray(geometry.coordinates)) {
    return path.bounds(feature as never);
  }

  let bestArea = -1;
  let bestBounds: [[number, number], [number, number]] | null = null;
  for (const coordinates of geometry.coordinates) {
    const polygon = {
      type: 'Feature',
      properties: {},
      geometry: { type: 'Polygon', coordinates },
    };
    const area = path.area(polygon as never);
    if (area > bestArea) {
      bestArea = area;
      bestBounds = path.bounds(polygon as never);
    }
  }
  return bestBounds;
}

export default function WorldMap({
  countries,
  selectedBloc,
  blocCountryIds,
  onHover,
  onClick,
  selectedCountry,
  mapMode,
  fossilFuelData,
  focusIso3,
}: WorldMapProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const gRef = useRef<d3.Selection<SVGGElement, unknown, null, undefined> | null>(null);
  const zoomRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);
  const transformRef = useRef<d3.ZoomTransform>(d3.zoomIdentity);
  const [worldData, setWorldData] = useState<Topology | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  // Set once the reader pans or zooms themselves, so the 110m -> 50m upgrade
  // cannot re-frame a map they have since moved.
  const userMovedRef = useRef(false);

  // Geometry loads in two passes.
  //
  // The 110m file is 38KB gzipped and draws immediately, so the map is
  // interactive on first paint. The 50m file is 230KB and carries 23 countries
  // that 110m omits entirely despite their having full generation records —
  // Hong Kong, Bahrain, Malta, Mauritius, Macao among them. Loading the big one
  // first would add ~190KB to first paint, a 52% increase on this page's
  // payload, for territories most visitors never look for.
  //
  // So: draw small, then upgrade. The redraw restores the current zoom
  // transform, and the two files use identical ISO numeric ids, so the swap
  // costs nothing but a little more coastline detail.
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const fast = await fetch('/data/world-110m.json').then((r) => r.json());
        if (cancelled) return;
        setWorldData(fast);

        const detailed = await fetch('/data/world-50m.json').then((r) => r.json());
        if (cancelled) return;
        setWorldData(detailed);
      } catch {
        // A failed upgrade leaves the 110m map in place, which is a working map.
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleMouseMove = useCallback(
    (event: MouseEvent, iso3: string | undefined) => {
      if (iso3 && countries[iso3]) {
        onHover(countries[iso3], event);
      } else {
        onHover(null, null);
      }
    },
    [countries, onHover]
  );

  const handleClick = useCallback(
    (iso3: string | undefined) => {
      if (iso3 && countries[iso3]) {
        onClick(countries[iso3]);
      } else {
        onClick(null);
      }
    },
    [countries, onClick]
  );

  useEffect(() => {
    if (!worldData || !svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const projection = d3.geoNaturalEarth1()
      .scale(MAP_WIDTH / 5.5)
      .translate([MAP_WIDTH / 2, MAP_HEIGHT / 2]);

    const path = d3.geoPath().projection(projection);

    const colorScale = createScaleForModeLatest(countries, mapMode);

    const geomCollection = worldData.objects.countries as GeometryCollection;
    const features = topojson.feature(worldData, geomCollection).features;

    // Read theme-aware colors from CSS variables
    const styles = getComputedStyle(document.documentElement);
    // Matches the MapLegend 'no data' swatch — one value, one meaning.
    const noDataColor = styles.getPropertyValue('--ink-700').trim() || '#1b2528';
    const borderColor = styles.getPropertyValue('--border').trim() || 'rgba(0,0,0,0.08)';
    const selectionColor = styles.getPropertyValue('--text-primary').trim() || '#1A1A1A';

    const g = svg.append('g');
    gRef.current = g;

    // Setup zoom behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([MIN_ZOOM, MAX_ZOOM])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
        transformRef.current = event.transform;
        setZoomLevel(event.transform.k);
        // Programmatic transforms carry no sourceEvent; a wheel, drag or pinch
        // does. Only the latter means the reader has taken over.
        if (event.sourceEvent) userMovedRef.current = true;
      });

    zoomRef.current = zoom;
    svg.call(zoom);

    // Restore previous zoom transform (prevents reset when selectedCountry changes)
    if (transformRef.current !== d3.zoomIdentity) {
      g.attr('transform', transformRef.current.toString());
      svg.call(zoom.transform, transformRef.current);
    }

    // Prevent zoom on double-click (we use click for country selection)
    svg.on('dblclick.zoom', null);

    // Layer 1: Country fills
    g.selectAll('path')
      .data(features)
      .join('path')
      .attr('d', path as never)
      .attr('fill', (d) => {
        const iso3 = getIso3(d.id);
        if (!iso3) return noDataColor;

        const result = getCountryValueForModeLatest(iso3, countries, mapMode, fossilFuelData);
        if (result === null) return noDataColor;

        if (selectedBloc !== 'ALL' && !blocCountryIds.has(iso3)) {
          return noDataColor;
        }

        return colorScale(result.value);
      })
      .attr('stroke', 'none')
      .attr('cursor', (d) => {
        const iso3 = getIso3(d.id);
        return iso3 && countries[iso3] ? 'pointer' : 'default';
      })
      .style('opacity', (d) => {
        const iso3 = getIso3(d.id);
        if (selectedBloc === 'ALL') return 1;
        return iso3 && blocCountryIds.has(iso3) ? 1 : 0.35;
      })
      .on('mousemove', function (event, d) {
        handleMouseMove(event, getIso3(d.id));
      })
      .on('mouseleave', () => {
        onHover(null, null);
      })
      .on('click', function (event, d) {
        handleClick(getIso3(d.id));
      });

    // Layer 2: All borders (interior + coastlines)
    g.append('path')
      .datum(topojson.mesh(worldData, worldData.objects.countries as GeometryCollection))
      .attr('fill', 'none')
      .attr('stroke', borderColor)
      .attr('stroke-width', 0.5)
      .attr('stroke-linejoin', 'round')
      .attr('d', path as never)
      .attr('pointer-events', 'none');

    // Layer 3: Selected country outline
    if (selectedCountry) {
      const selectedFeature = features.find(f => getIso3(f.id) === selectedCountry.iso3);
      if (selectedFeature) {
        g.append('path')
          .datum(selectedFeature)
          .attr('d', path as never)
          .attr('fill', 'none')
          .attr('stroke', selectionColor)
          .attr('stroke-width', 1.5)
          .attr('pointer-events', 'none');
      }
    }

  }, [worldData, countries, selectedBloc, blocCountryIds, selectedCountry, handleMouseMove, handleClick, onHover, mapMode, fossilFuelData]);


  /**
   * Frame the map on `focusIso3`, arriving from a "see on map" link.
   *
   * Bounds come from the country's LARGEST landmass, not from the whole
   * feature, and that is the part that matters. `path.bounds()` of the feature
   * spans every scattered territory it owns, which is nonsense to zoom to: the
   * Netherlands measures 196px wide because of Aruba and Curacao, Fiji 943px
   * because it straddles the antimeridian, New Zealand 897px because of the
   * Kermadecs. All three fell back to no zoom at all. Against the main landmass
   * they are 8.5, 3.7 and 28.7px, which frame properly.
   *
   * Runs again when the 50m geometry replaces the 110m: some countries are not
   * in the small file at all, and a redraw mid-transition would otherwise leave
   * the map stranded part-way. Re-running from wherever it got to lands it in
   * the right place. It gives way to the reader, though - once they have panned
   * or zoomed themselves, the upgrade must not yank the map back.
   */
  useEffect(() => {
    if (!focusIso3 || !worldData || !svgRef.current || !zoomRef.current) return;
    if (userMovedRef.current) return;

    const projection = d3.geoNaturalEarth1()
      .scale(MAP_WIDTH / 5.5)
      .translate([MAP_WIDTH / 2, MAP_HEIGHT / 2]);
    const path = d3.geoPath().projection(projection);

    const geomCollection = worldData.objects.countries as GeometryCollection;
    const feature = topojson
      .feature(worldData, geomCollection)
      .features.find((f) => getIso3(f.id) === focusIso3);
    // Absent from the 110m subset; the 50m upgrade re-runs this and finds it.
    if (!feature) return;

    const bounds = mainlandBounds(feature as BoundsFeature, path);
    if (!bounds) return;
    const [[x0, y0], [x1, y1]] = bounds;
    const w = Math.max(x1 - x0, 1);
    const h = Math.max(y1 - y0, 1);
    const k = Math.min(
      MAX_ZOOM,
      Math.max(MIN_ZOOM, Math.min(MAP_WIDTH / (w * FOCUS_CONTEXT), MAP_HEIGHT / (h * FOCUS_CONTEXT)))
    );

    const transform = d3.zoomIdentity
      .translate(MAP_WIDTH / 2, MAP_HEIGHT / 2)
      .scale(k)
      .translate(-(x0 + x1) / 2, -(y0 + y1) / 2);

    // `tokens/motion.css` zeroes every duration under prefers-reduced-motion,
    // but that only reaches CSS. This pan is a 700ms camera move the reader did
    // not ask for, so it honours the same preference by simply arriving.
    const svg = d3.select(svgRef.current);
    const reduced =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    if (reduced) svg.call(zoomRef.current.transform, transform);
    else svg.transition().duration(700).call(zoomRef.current.transform, transform);
  }, [focusIso3, worldData]);

  // Zoom control functions
  const handleZoomIn = useCallback(() => {
    if (!svgRef.current || !zoomRef.current) return;
    const svg = d3.select(svgRef.current);
    zoomRef.current.scaleBy(svg.transition().duration(300), 1.5);
  }, []);

  const handleZoomOut = useCallback(() => {
    if (!svgRef.current || !zoomRef.current) return;
    const svg = d3.select(svgRef.current);
    zoomRef.current.scaleBy(svg.transition().duration(300), 1 / 1.5);
  }, []);

  const handleZoomReset = useCallback(() => {
    if (!svgRef.current || !zoomRef.current) return;
    const svg = d3.select(svgRef.current);
    svg.transition().duration(300).call(
      zoomRef.current.transform,
      d3.zoomIdentity
    );
  }, []);

  return (
    <div className="relative w-full h-full">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`}
        preserveAspectRatio="xMidYMid meet"
        className="w-full h-full"
      />
      {/* Zoom controls */}
      <div className="absolute bottom-3 right-3 flex flex-col gap-1">
        <ZoomButton onClick={handleZoomIn} disabled={zoomLevel >= MAX_ZOOM} title="Zoom in">
          +
        </ZoomButton>
        <ZoomButton onClick={handleZoomOut} disabled={zoomLevel <= MIN_ZOOM} title="Zoom out">
          −
        </ZoomButton>
        <ZoomButton onClick={handleZoomReset} disabled={zoomLevel === 1} title="Reset zoom">
          ⟲
        </ZoomButton>
      </div>
      {/* Zoom level indicator */}
      {zoomLevel > 1 && (
        <div className="absolute bottom-3 left-3 px-2 py-1 bg-card/90 border border-border rounded text-xs text-muted">
          {zoomLevel.toFixed(1)}x
        </div>
      )}
    </div>
  );
}
