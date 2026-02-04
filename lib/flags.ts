// ISO 3166-1 alpha-3 to alpha-2 mapping for our 88 data countries
const iso3ToIso2: Record<string, string> = {
  AFG: 'AF', ALB: 'AL', DZA: 'DZ', AGO: 'AO', ARG: 'AR',
  ARM: 'AM', AUS: 'AU', AUT: 'AT', AZE: 'AZ', BGD: 'BD',
  BLR: 'BY', BEL: 'BE', BOL: 'BO', BIH: 'BA', BRA: 'BR',
  BGR: 'BG', MMR: 'MM', CAN: 'CA', CHL: 'CL', CHN: 'CN',
  COL: 'CO', CRI: 'CR', HRV: 'HR', CYP: 'CY', CZE: 'CZ',
  DNK: 'DK', DOM: 'DO', ECU: 'EC', EGY: 'EG', SLV: 'SV',
  EST: 'EE', ETH: 'ET', FIN: 'FI', FRA: 'FR', GEO: 'GE',
  DEU: 'DE', GRC: 'GR', HUN: 'HU', IND: 'IN', IDN: 'ID',
  IRN: 'IR', IRQ: 'IQ', IRL: 'IE', ISR: 'IL', ITA: 'IT',
  JPN: 'JP', JOR: 'JO', KAZ: 'KZ', KEN: 'KE', KOR: 'KR',
  KWT: 'KW', KGZ: 'KG', LBN: 'LB', LVA: 'LV', LTU: 'LT',
  LUX: 'LU', MYS: 'MY', MEX: 'MX', MDA: 'MD', MNG: 'MN',
  MNE: 'ME', MAR: 'MA', NLD: 'NL', NZL: 'NZ', NGA: 'NG',
  MKD: 'MK', NOR: 'NO', OMN: 'OM', PAK: 'PK', PER: 'PE',
  PHL: 'PH', POL: 'PL', PRT: 'PT', PRI: 'PR', QAT: 'QA',
  ROU: 'RO', RUS: 'RU', SAU: 'SA', SRB: 'RS', SGP: 'SG',
  SVK: 'SK', SVN: 'SI', ZAF: 'ZA', ESP: 'ES', LKA: 'LK',
  SWE: 'SE', CHE: 'CH', TWN: 'TW', TJK: 'TJ', THA: 'TH',
  TUN: 'TN', TUR: 'TR', UKR: 'UA', ARE: 'AE', GBR: 'GB',
  USA: 'US', URY: 'UY', VEN: 'VE', VNM: 'VN',
};

/** Get ISO2 code from ISO3 */
export function getIso2(iso3: string): string | undefined {
  return iso3ToIso2[iso3];
}

/** Get flag CDN URL for an ISO3 country code */
export function getFlagUrl(iso3: string, size: number = 24): string | null {
  const iso2 = iso3ToIso2[iso3];
  if (!iso2) return null;
  return `https://flagcdn.com/w${size}/${iso2.toLowerCase()}.png`;
}
