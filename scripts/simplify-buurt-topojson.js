/**
 * Vereenvoudigt de buurt-TopoJSON één keer offline, in plaats van bij elke
 * paginalading in de browser.
 *
 * prepareJSONData deed presimplify() + simplify(0.000001) aan de clientkant. Die
 * presimplify hangt aan elk van de ruim een miljoen punten een extra gewicht en
 * tilde het geheugengebruik van ongeveer 108 naar 345 MB - de piek waardoor iOS
 * Safari het tabblad afschoot. Het resultaat is elke keer identiek, dus het hoort
 * in de bouwstap.
 *
 * Gebruik:
 *   node scripts/simplify-buurt-topojson.js
 *
 * Schrijft static/Buurt2024_presimplified.json.gz. Upload dat bestand naar de
 * bucket en wijs BUURT_GEOJSON_URL in src/lib/datasets.js ernaartoe.
 */

import fs from 'fs';
import path from 'path';
import zlib from 'zlib';
import { fileURLToPath } from 'url';
import * as topojsonsimplify from 'topojson-simplify';
import { BUURT_GEOJSON_URL } from '../src/lib/datasets.js';

// Zelfde tolerantie als voorheen in prepareJSONData. Niet verhogen zonder te
// controleren: kleine buurten zoals Paesens (BU19700401) worden bij 0.00001
// gereduceerd tot ontaarde driehoeken, wat D3 laat struikelen.
const TOLERANCE = 0.000001;

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT = path.join(__dirname, '..', 'static', 'Buurt2024_presimplified.json.gz');

const mb = (bytes) => (bytes / 1048576).toFixed(1) + ' MB';
const countPoints = (topo) => topo.arcs.reduce((sum, arc) => sum + arc.length, 0);

async function main() {
  console.log('Bron:', BUURT_GEOJSON_URL);

  const response = await fetch(BUURT_GEOJSON_URL);
  if (!response.ok) {
    throw new Error(`Downloaden mislukt: ${response.status} ${response.statusText}`);
  }
  const gz = Buffer.from(await response.arrayBuffer());
  console.log('  gedownload:', mb(gz.length));

  let topo = JSON.parse(zlib.gunzipSync(gz).toString('utf8'));
  if (!topo.objects) {
    throw new Error('Bestand is geen TopoJSON (geen "objects")');
  }

  const before = countPoints(topo);
  console.log('  punten in bron:', before.toLocaleString('nl-NL'));

  topo = topojsonsimplify.presimplify(topo);
  topo = topojsonsimplify.simplify(topo, TOLERANCE);

  const after = countPoints(topo);
  console.log(`  punten na simplify(${TOLERANCE}):`, after.toLocaleString('nl-NL'),
    `(${(100 * (1 - after / before)).toFixed(1)}% minder)`);

  const json = JSON.stringify(topo);
  const out = zlib.gzipSync(json, { level: 9 });
  fs.writeFileSync(OUTPUT, out);

  console.log('\nGeschreven:', path.relative(process.cwd(), OUTPUT));
  console.log('  ongecomprimeerd:', mb(json.length));
  console.log('  gzipped:        ', mb(out.length), `(was ${mb(gz.length)})`);
  console.log('\nVolgende stappen:');
  console.log('  1. Upload naar buurtdashboard-data/buurtdashboard-KEA/geojsondata/');
  console.log('  2. Wijs BUURT_GEOJSON_URL in src/lib/datasets.js naar het nieuwe bestand');
  console.log('  3. De presimplify/simplify in prepareJSONData.js kan dan weg');
}

main().catch((error) => {
  console.error('Mislukt:', error.message);
  process.exit(1);
});
