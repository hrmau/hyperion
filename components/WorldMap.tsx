'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import * as d3 from 'd3';
import * as topojson from 'topojson-client';
import type { Topology, GeometryCollection } from 'topojson-specification';
import type { CountriesData, Country } from '@/lib/types';
import { createChoroplethScale } from '@/lib/scales';

interface WorldMapProps {
  countries: CountriesData;
  year: number;
  selectedBloc: string;
  blocCountryIds: Set<string>;
  onHover: (country: Country | null, event: MouseEvent | null) => void;
  onClick: (country: Country | null) => void;
  selectedCountry: Country | null;
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

// Fixed viewBox dimensions so the map renders consistently
const MAP_WIDTH = 960;
const MAP_HEIGHT = 500;

export default function WorldMap({
  countries,
  year,
  selectedBloc,
  blocCountryIds,
  onHover,
  onClick,
  selectedCountry,
}: WorldMapProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [worldData, setWorldData] = useState<Topology | null>(null);

  // Load TopoJSON
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

  // Render map
  useEffect(() => {
    if (!worldData || !svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    // Use fixed viewBox dimensions — SVG scales via viewBox + preserveAspectRatio
    const projection = d3.geoNaturalEarth1()
      .scale(MAP_WIDTH / 5.5)
      .translate([MAP_WIDTH / 2, MAP_HEIGHT / 2]);

    const path = d3.geoPath().projection(projection);

    const colorScale = createChoroplethScale(countries, year);

    const geomCollection = worldData.objects.countries as GeometryCollection;
    const features = topojson.feature(worldData, geomCollection).features;

    const g = svg.append('g');

    g.selectAll('path')
      .data(features)
      .join('path')
      .attr('d', path as never)
      .attr('fill', (d) => {
        const iso3 = getIso3(d.id);
        const country = iso3 ? countries[iso3] : undefined;
        const yearData = country?.years[year.toString()];

        if (!yearData) return '#E5E7EB';

        if (selectedBloc !== 'ALL' && iso3 && !blocCountryIds.has(iso3)) {
          return '#E5E7EB';
        }

        return colorScale(yearData.total_generation_twh);
      })
      .attr('stroke', (d) => {
        const iso3 = getIso3(d.id);
        return selectedCountry?.iso3 === iso3 ? '#1A1A1A' : '#FFFFFF';
      })
      .attr('stroke-width', (d) => {
        const iso3 = getIso3(d.id);
        return selectedCountry?.iso3 === iso3 ? 2 : 0.5;
      })
      .attr('cursor', (d) => {
        const iso3 = getIso3(d.id);
        return iso3 && countries[iso3] ? 'pointer' : 'default';
      })
      .style('opacity', (d) => {
        const iso3 = getIso3(d.id);
        if (selectedBloc === 'ALL') return 1;
        return iso3 && blocCountryIds.has(iso3) ? 1 : 0.3;
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

    // Draw clean border mesh
    g.append('path')
      .datum(topojson.mesh(worldData, worldData.objects.countries as GeometryCollection, (a, b) => a !== b))
      .attr('fill', 'none')
      .attr('stroke', '#FFFFFF')
      .attr('stroke-width', 0.5)
      .attr('d', path as never);

  }, [worldData, countries, year, selectedBloc, blocCountryIds, selectedCountry, handleMouseMove, handleClick, onHover]);

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`}
      preserveAspectRatio="xMidYMid meet"
      className="w-full h-full"
    />
  );
}
