// ISO 3166-1 alpha-3 to alpha-2 mapping for all data countries
const iso3ToIso2: Record<string, string> = {
  // Original 88 countries
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

  // Additional countries from expanded dataset
  ABW: 'AW', ASM: 'AS', ATG: 'AG', BDI: 'BI', BEN: 'BJ',
  BFA: 'BF', BHR: 'BH', BHS: 'BS', BLZ: 'BZ', BMU: 'BM',
  BRB: 'BB', BRN: 'BN', BTN: 'BT', BWA: 'BW', CAF: 'CF',
  CIV: 'CI', CMR: 'CM', COD: 'CD', COG: 'CG', COK: 'CK',
  COM: 'KM', CPV: 'CV', CUB: 'CU', CYM: 'KY', DJI: 'DJ',
  DMA: 'DM', ERI: 'ER', ESH: 'EH', FJI: 'FJ', FLK: 'FK',
  FRO: 'FO', GAB: 'GA', GHA: 'GH', GIB: 'GI', GIN: 'GN',
  GLP: 'GP', GMB: 'GM', GNB: 'GW', GNQ: 'GQ', GRD: 'GD',
  GRL: 'GL', GTM: 'GT', GUF: 'GF', GUM: 'GU', GUY: 'GY',
  HKG: 'HK', HND: 'HN', HTI: 'HT', ISL: 'IS', JAM: 'JM',
  KHM: 'KH', KIR: 'KI', KNA: 'KN', LAO: 'LA', LBR: 'LR',
  LBY: 'LY', LCA: 'LC', LSO: 'LS', MAC: 'MO', MDG: 'MG',
  MDV: 'MV', MLI: 'ML', MLT: 'MT', MOZ: 'MZ', MRT: 'MR',
  MSR: 'MS', MTQ: 'MQ', MUS: 'MU', MWI: 'MW', NAM: 'NA',
  NCL: 'NC', NER: 'NE', NIC: 'NI', NIU: 'NU', NPL: 'NP',
  NRU: 'NR', PAN: 'PA', PNG: 'PG', PRK: 'KP', PRY: 'PY',
  PSE: 'PS', PYF: 'PF', REU: 'RE', RWA: 'RW', SDN: 'SD',
  SEN: 'SN', SHN: 'SH', SLB: 'SB', SLE: 'SL', SOM: 'SO',
  SPM: 'PM', SSD: 'SS', STP: 'ST', SUR: 'SR', SWZ: 'SZ',
  SYC: 'SC', SYR: 'SY', TCA: 'TC', TCD: 'TD', TGO: 'TG',
  TKM: 'TM', TLS: 'TL', TON: 'TO', TTO: 'TT', TZA: 'TZ',
  UGA: 'UG', UZB: 'UZ', VCT: 'VC', VGB: 'VG', VIR: 'VI',
  VUT: 'VU', WSM: 'WS', YEM: 'YE', ZMB: 'ZM', ZWE: 'ZW',
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
