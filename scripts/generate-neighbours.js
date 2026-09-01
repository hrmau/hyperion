#!/usr/bin/env node
/**
 * Who actually borders whom.
 *
 *   in   public/data/world-50m.json, data/iso-numeric.json
 *   out  public/data/neighbours.json   { ISO3: { borders: [], nearest: [] } }
 *
 * The country pages offered "grids of a similar size nearby", picked by region
 * and output. Asia is a region, so the United Arab Emirates was offered Thailand
 * as a neighbour, which is not a defensible use of the word.
 *
 * Adjacency is not extra data we have to go and find: a TopoJSON topology
 * already encodes it. Arcs are shared between the polygons either side of them,
 * so two countries referencing the same arc share a border, and that is exactly
 * what the format exists to express.
 *
 * Islands share no arcs with anyone, so `nearest` carries a great-circle
 * fallback computed from decoded centroids. Iceland gets the Faroes and Norway
 * rather than nothing.
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const topo = JSON.parse(fs.readFileSync(path.join(ROOT, 'public/data/world-50m.json'), 'utf8'));
const numericToIso3 = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/iso-numeric.json'), 'utf8'));

const geometries = topo.objects.countries.geometries;

/** Every arc index a geometry references, sign-normalised. */
function arcsOf(geometry) {
  const out = [];
  const walk = (node) => {
    if (typeof node === 'number') out.push(node < 0 ? ~node : node);
    else if (Array.isArray(node)) node.forEach(walk);
  };
  walk(geometry.arcs);
  return out;
}

/** Delta-decoded, de-quantised ring coordinates. */
function decodeArc(arc, transform) {
  let x = 0;
  let y = 0;
  return arc.map(([dx, dy]) => {
    x += dx;
    y += dy;
    return transform
      ? [x * transform.scale[0] + transform.translate[0], y * transform.scale[1] + transform.translate[1]]
      : [x, y];
  });
}

const R = 6371;
const rad = (d) => (d * Math.PI) / 180;

const arcOwners = new Map();
const centroids = {};

for (const g of geometries) {
  const iso3 = numericToIso3[String(g.id)];
  if (!iso3) continue;

  const arcs = arcsOf(g);
  for (const a of arcs) {
    if (!arcOwners.has(a)) arcOwners.set(a, new Set());
    arcOwners.get(a).add(iso3);
  }

  // Centroid, averaged as vectors on the unit sphere rather than as raw
  // longitudes.
  //
  // Averaging degrees breaks at the antimeridian: Fiji sits either side of 180,
  // so the naive mean put its centroid near 0 longitude and the script offered
  // it Mauritius, Madagascar and the Seychelles as its nearest grids. Summing
  // 3D unit vectors and converting back has no seam, and it fixes Russia, New
  // Zealand, Kiribati and the Aleutians for the same reason.
  let x = 0;
  let y = 0;
  let z = 0;
  let n = 0;
  for (const a of arcs) {
    for (const [lon, lat] of decodeArc(topo.arcs[a], topo.transform)) {
      const la = rad(lat);
      const lo = rad(lon);
      x += Math.cos(la) * Math.cos(lo);
      y += Math.cos(la) * Math.sin(lo);
      z += Math.sin(la);
      n++;
    }
  }
  if (n) {
    const hyp = Math.hypot(x / n, y / n);
    centroids[iso3] = [
      (Math.atan2(y / n, x / n) * 180) / Math.PI,
      (Math.atan2(z / n, hyp) * 180) / Math.PI,
    ];
  }
}

const borders = {};
for (const owners of arcOwners.values()) {
  if (owners.size < 2) continue;
  const list = [...owners];
  for (const a of list) {
    for (const b of list) {
      if (a === b) continue;
      (borders[a] = borders[a] || new Set()).add(b);
    }
  }
}

function greatCircle([lon1, lat1], [lon2, lat2]) {
  const dLat = rad(lat2 - lat1);
  const dLon = rad(lon2 - lon1);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}

const out = {};
const isoCodes = Object.keys(centroids).sort();
for (const iso of isoCodes) {
  const nearest = isoCodes
    .filter((o) => o !== iso)
    .map((o) => ({ iso: o, km: greatCircle(centroids[iso], centroids[o]) }))
    .sort((a, b) => a.km - b.km)
    .slice(0, 12)
    .map((x) => x.iso);

  out[iso] = {
    borders: [...(borders[iso] || [])].sort(),
    nearest,
  };
}

fs.writeFileSync(
  path.join(ROOT, 'public/data/neighbours.json'),
  JSON.stringify(out, null, 0)
);

const withBorders = isoCodes.filter((i) => out[i].borders.length).length;
console.log(`Countries mapped: ${isoCodes.length}`);
console.log(`With land borders: ${withBorders}   islands (nearest only): ${isoCodes.length - withBorders}`);
for (const probe of ['ARE', 'IRL', 'DEU', 'ISL', 'NGA', 'FJI']) {
  if (!out[probe]) continue;
  const b = out[probe].borders;
  console.log(`  ${probe}: borders [${b.join(', ') || 'none'}]  nearest [${out[probe].nearest.slice(0, 4).join(', ')}]`);
}
