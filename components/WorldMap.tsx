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

// Complete ISO numeric → ISO3 mapping for all 88 data countries
const numericToIso3: Record<string, string> = {
  '004': 'AFG', '008': 'ALB', '012': 'DZA', '024': 'AGO', '031': 'AZE',
  '032': 'ARG', '036': 'AUS', '040': 'AUT', '050': 'BGD', '051': 'ARM',
  '056': 'BEL', '068': 'BOL', '070': 'BIH', '076': 'BRA', '100': 'BGR',
  '104': 'MMR', '112': 'BLR', '124': 'CAN', '144': 'LKA', '152': 'CHL',
  '156': 'CHN', '158': 'TWN', '170': 'COL', '188': 'CRI', '191': 'HRV',
  '196': 'CYP', '203': 'CZE', '208': 'DNK', '214': 'DOM', '218': 'ECU',
  '222': 'SLV', '231': 'ETH', '233': 'EST', '246': 'FIN', '250': 'FRA',
  '268': 'GEO', '276': 'DEU', '300': 'GRC', '348': 'HUN', '356': 'IND',
  '360': 'IDN', '364': 'IRN', '368': 'IRQ', '372': 'IRL', '376': 'ISR',
  '380': 'ITA', '392': 'JPN', '398': 'KAZ', '400': 'JOR', '404': 'KEN',
  '410': 'KOR', '414': 'KWT', '417': 'KGZ', '422': 'LBN', '428': 'LVA',
  '440': 'LTU', '442': 'LUX', '458': 'MYS', '484': 'MEX', '496': 'MNG',
  '498': 'MDA', '499': 'MNE', '504': 'MAR', '512': 'OMN', '528': 'NLD',
  '554': 'NZL', '566': 'NGA', '578': 'NOR', '586': 'PAK', '604': 'PER',
  '608': 'PHL', '616': 'POL', '620': 'PRT', '630': 'PRI', '634': 'QAT',
  '642': 'ROU', '643': 'RUS', '682': 'SAU', '688': 'SRB', '702': 'SGP',
  '703': 'SVK', '705': 'SVN', '710': 'ZAF', '724': 'ESP', '752': 'SWE',
  '756': 'CHE', '762': 'TJK', '764': 'THA', '788': 'TUN', '792': 'TUR',
  '804': 'UKR', '807': 'MKD', '818': 'EGY', '826': 'GBR', '840': 'USA',
  '858': 'URY', '862': 'VEN', '704': 'VNM', '784': 'ARE',
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

  useEffect(() => {
    fetch('/data/world-110m.json')
      .then(res => res.json())
      .then(data => setWorldData(data));
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
    const noDataColor = styles.getPropertyValue('--choro-1').trim() || '#F3F4F6';
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
