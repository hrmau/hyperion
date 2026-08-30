'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import * as d3 from 'd3';
import * as topojson from 'topojson-client';
import type { Topology, GeometryCollection } from 'topojson-specification';
import type { CountriesData, Country, FossilFuelData } from '@/lib/types';
import type { MapColorMode } from '@/lib/colors';
import { createScaleForModeLatest, getCountryValueForModeLatest } from '@/lib/scales';

interface WorldMapProps {
  countries: CountriesData;
  selectedBloc: string;
  blocCountryIds: Set<string>;
  onHover: (country: Country | null, event: MouseEvent | null) => void;
  onClick: (country: Country | null) => void;
  selectedCountry: Country | null;
  mapMode: MapColorMode;
  fossilFuelData: FossilFuelData | null;
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
const numericToIso3: Record<string, string> = {
  '004': 'AFG', '008': 'ALB', '012': 'DZA', '016': 'ASM', '024': 'AGO',
  '031': 'AZE', '032': 'ARG', '036': 'AUS', '040': 'AUT', '044': 'BHS',
  '048': 'BHR', '050': 'BGD', '051': 'ARM', '052': 'BRB', '056': 'BEL',
  '060': 'BMU', '064': 'BTN', '068': 'BOL', '070': 'BIH', '072': 'BWA',
  '076': 'BRA', '084': 'BLZ', '090': 'SLB', '096': 'BRN', '100': 'BGR',
  '104': 'MMR', '108': 'BDI', '112': 'BLR', '116': 'KHM', '120': 'CMR',
  '124': 'CAN', '140': 'CAF', '144': 'LKA', '148': 'TCD', '152': 'CHL',
  '156': 'CHN', '158': 'TWN', '170': 'COL', '174': 'COM', '178': 'COG',
  '180': 'COD', '188': 'CRI', '191': 'HRV', '192': 'CUB', '196': 'CYP',
  '203': 'CZE', '204': 'BEN', '208': 'DNK', '212': 'DMA', '214': 'DOM',
  '218': 'ECU', '222': 'SLV', '226': 'GNQ', '231': 'ETH', '232': 'ERI',
  '233': 'EST', '238': 'FLK', '242': 'FJI', '246': 'FIN', '250': 'FRA',
  '262': 'DJI', '266': 'GAB', '268': 'GEO', '270': 'GMB', '275': 'PSE',
  '276': 'DEU', '288': 'GHA', '296': 'KIR', '300': 'GRC', '304': 'GRL',
  '308': 'GRD', '316': 'GUM', '320': 'GTM', '324': 'GIN', '328': 'GUY',
  '332': 'HTI', '340': 'HND', '344': 'HKG', '348': 'HUN', '352': 'ISL',
  '356': 'IND', '360': 'IDN', '364': 'IRN', '368': 'IRQ', '372': 'IRL',
  '376': 'ISR', '380': 'ITA', '384': 'CIV', '388': 'JAM', '392': 'JPN',
  '398': 'KAZ', '400': 'JOR', '404': 'KEN', '408': 'PRK', '410': 'KOR',
  '414': 'KWT', '417': 'KGZ', '418': 'LAO', '422': 'LBN', '426': 'LSO',
  '428': 'LVA', '430': 'LBR', '434': 'LBY', '440': 'LTU', '442': 'LUX',
  '446': 'MAC', '450': 'MDG', '454': 'MWI', '458': 'MYS', '462': 'MDV',
  '466': 'MLI', '470': 'MLT', '478': 'MRT', '480': 'MUS', '484': 'MEX',
  '496': 'MNG', '498': 'MDA', '499': 'MNE', '500': 'MSR', '504': 'MAR',
  '508': 'MOZ', '512': 'OMN', '516': 'NAM', '520': 'NRU', '524': 'NPL',
  '528': 'NLD', '533': 'ABW', '540': 'NCL', '548': 'VUT', '554': 'NZL',
  '558': 'NIC', '562': 'NER', '566': 'NGA', '570': 'NIU', '578': 'NOR',
  '586': 'PAK', '591': 'PAN', '598': 'PNG', '600': 'PRY', '604': 'PER',
  '608': 'PHL', '616': 'POL', '620': 'PRT', '624': 'GNB', '626': 'TLS',
  '630': 'PRI', '634': 'QAT', '642': 'ROU', '643': 'RUS', '646': 'RWA',
  '654': 'SHN', '662': 'LCA', '682': 'SAU', '686': 'SEN', '688': 'SRB',
  '690': 'SYC', '694': 'SLE', '702': 'SGP', '703': 'SVK', '704': 'VNM',
  '705': 'SVN', '706': 'SOM', '710': 'ZAF', '716': 'ZWE', '724': 'ESP',
  '728': 'SSD', '729': 'SDN', '732': 'ESH', '740': 'SUR', '748': 'SWZ',
  '752': 'SWE', '756': 'CHE', '760': 'SYR', '762': 'TJK', '764': 'THA',
  '768': 'TGO', '776': 'TON', '780': 'TTO', '784': 'ARE', '788': 'TUN',
  '792': 'TUR', '795': 'TKM', '800': 'UGA', '804': 'UKR', '807': 'MKD',
  '818': 'EGY', '826': 'GBR', '834': 'TZA', '840': 'USA', '854': 'BFA',
  '858': 'URY', '860': 'UZB', '862': 'VEN', '882': 'WSM', '887': 'YEM',
  '894': 'ZMB',
};

function getIso3(featureId: string | number | undefined): string | undefined {
  if (featureId == null) return undefined;
  const numericId = featureId.toString().padStart(3, '0');
  return numericToIso3[numericId];
}

const MAP_WIDTH = 960;
const MAP_HEIGHT = 500;

const MIN_ZOOM = 1;
const MAX_ZOOM = 8;

export default function WorldMap({
  countries,
  selectedBloc,
  blocCountryIds,
  onHover,
  onClick,
  selectedCountry,
  mapMode,
  fossilFuelData,
}: WorldMapProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const gRef = useRef<d3.Selection<SVGGElement, unknown, null, undefined> | null>(null);
  const zoomRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);
  const transformRef = useRef<d3.ZoomTransform>(d3.zoomIdentity);
  const [worldData, setWorldData] = useState<Topology | null>(null);
  const [isDark, setIsDark] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);

  // Watch for theme changes so the map re-renders with correct colors
  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'));
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains('dark'));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

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

  }, [worldData, countries, selectedBloc, blocCountryIds, selectedCountry, handleMouseMove, handleClick, onHover, isDark, mapMode, fossilFuelData]);

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
