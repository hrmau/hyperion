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

// ISO numeric to ISO3 mapping for common countries
const numericToIso3: Record<string, string> = {
  '004': 'AFG', '008': 'ALB', '012': 'DZA', '024': 'AGO', '032': 'ARG',
  '036': 'AUS', '040': 'AUT', '050': 'BGD', '056': 'BEL', '076': 'BRA',
  '100': 'BGR', '124': 'CAN', '152': 'CHL', '156': 'CHN', '170': 'COL',
  '191': 'HRV', '203': 'CZE', '208': 'DNK', '818': 'EGY', '233': 'EST',
  '231': 'ETH', '246': 'FIN', '250': 'FRA', '276': 'DEU', '300': 'GRC',
  '348': 'HUN', '356': 'IND', '360': 'IDN', '364': 'IRN', '368': 'IRQ',
  '372': 'IRL', '376': 'ISR', '380': 'ITA', '392': 'JPN', '400': 'JOR',
  '398': 'KAZ', '404': 'KEN', '410': 'KOR', '414': 'KWT', '428': 'LVA',
  '422': 'LBN', '440': 'LTU', '458': 'MYS', '484': 'MEX', '504': 'MAR',
  '528': 'NLD', '554': 'NZL', '566': 'NGA', '578': 'NOR', '586': 'PAK',
  '604': 'PER', '608': 'PHL', '616': 'POL', '620': 'PRT', '634': 'QAT',
  '642': 'ROU', '643': 'RUS', '682': 'SAU', '688': 'SRB', '702': 'SGP',
  '703': 'SVK', '705': 'SVN', '710': 'ZAF', '724': 'ESP', '752': 'SWE',
  '756': 'CHE', '764': 'THA', '792': 'TUR', '804': 'UKR', '784': 'ARE',
  '826': 'GBR', '840': 'USA', '704': 'VNM', '862': 'VEN',
};

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

    const width = svgRef.current.clientWidth;
    const height = svgRef.current.clientHeight;

    // Projection
    const projection = d3.geoNaturalEarth1()
      .scale(width / 5.5)
      .translate([width / 2, height / 2]);

    const path = d3.geoPath().projection(projection);

    // Color scale
    const colorScale = createChoroplethScale(countries, year);

    // Get features
    const geomCollection = worldData.objects.countries as GeometryCollection;
    const features = topojson.feature(worldData, geomCollection).features;

    // Draw countries
    svg
      .append('g')
      .selectAll('path')
      .data(features)
      .join('path')
      .attr('d', path as never)
      .attr('fill', (d) => {
        const numericId = d.id?.toString().padStart(3, '0');
        const iso3 = numericId ? numericToIso3[numericId] : undefined;
        const country = iso3 ? countries[iso3] : undefined;
        const yearData = country?.years[year.toString()];

        if (!yearData) return '#E5E7EB';

        // Dim countries not in selected bloc
        if (selectedBloc !== 'ALL' && iso3 && !blocCountryIds.has(iso3)) {
          return '#E5E7EB';
        }

        return colorScale(yearData.total_generation_twh);
      })
      .attr('stroke', (d) => {
        const numericId = d.id?.toString().padStart(3, '0');
        const iso3 = numericId ? numericToIso3[numericId] : undefined;
        return selectedCountry?.iso3 === iso3 ? '#1A1A1A' : '#FFFFFF';
      })
      .attr('stroke-width', (d) => {
        const numericId = d.id?.toString().padStart(3, '0');
        const iso3 = numericId ? numericToIso3[numericId] : undefined;
        return selectedCountry?.iso3 === iso3 ? 2 : 0.5;
      })
      .attr('cursor', (d) => {
        const numericId = d.id?.toString().padStart(3, '0');
        const iso3 = numericId ? numericToIso3[numericId] : undefined;
        return iso3 && countries[iso3] ? 'pointer' : 'default';
      })
      .style('opacity', (d) => {
        const numericId = d.id?.toString().padStart(3, '0');
        const iso3 = numericId ? numericToIso3[numericId] : undefined;
        if (selectedBloc === 'ALL') return 1;
        return iso3 && blocCountryIds.has(iso3) ? 1 : 0.3;
      })
      .on('mousemove', function (event, d) {
        const numericId = d.id?.toString().padStart(3, '0');
        const iso3 = numericId ? numericToIso3[numericId] : undefined;
        handleMouseMove(event, iso3);
      })
      .on('mouseleave', () => {
        onHover(null, null);
      })
      .on('click', function (event, d) {
        const numericId = d.id?.toString().padStart(3, '0');
        const iso3 = numericId ? numericToIso3[numericId] : undefined;
        handleClick(iso3);
      });

  }, [worldData, countries, year, selectedBloc, blocCountryIds, selectedCountry, handleMouseMove, handleClick, onHover]);

  return (
    <svg
      ref={svgRef}
      className="w-full h-full"
      style={{ minHeight: '400px' }}
    />
  );
}
