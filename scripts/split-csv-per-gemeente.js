/**
 * Splitst de landelijke buurt-CSV in één bestand per gemeente.
 *
 * Het dashboard toont één gemeente tegelijk - ongeveer vijftig buurten - maar
 * laadt er 14.574. Dat kost rond de 223 MB aan geheugen en is de reden dat iOS
 * Safari het tabblad afschiet. Nederland-brede cijfers komen al uit
 * static/nederland-aggregates.json, dus de ruwe landelijke set is niet nodig.
 *
 * Gebruik:
 *   node scripts/split-csv-per-gemeente.js
 *
 * Schrijft generated/csv-per-gemeente/<gemeentecode>.csv.gz plus een index.json met
 * het aantal buurten per gemeente.
 */

import fs from 'fs';
import path from 'path';
import zlib from 'zlib';
import { fileURLToPath } from 'url';
import { dsvFormat } from 'd3-dsv';
import { CONFIG_PORTAL_URL, CONFIG_MODE, DASHBOARD_SLUGS, buildConfigJsonUrl } from '../src/lib/datasets.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// Buiten static/: deze bestanden worden vanuit de bucket geserveerd, niet
// vanaf Vercel. In static/ zouden ze bij elke deploy onnodig meegaan.
const OUTPUT_DIR = path.join(__dirname, '..', 'generated', 'csv-per-gemeente');
const SEPARATOR = ';';
const MUNICIPALITY_COLUMN = 'gemeentecode';

const mb = (bytes) => (bytes / 1048576).toFixed(2) + ' MB';

async function main() {
  const configUrl = buildConfigJsonUrl(DASHBOARD_SLUGS.default, CONFIG_MODE);
  console.log('Config:', configUrl);
  const config = await fetch(configUrl).then((r) => r.json());

  const csvUrl = config.csv_data_url;
  console.log('CSV:   ', csvUrl);

  const gz = Buffer.from(await fetch(csvUrl).then((r) => r.arrayBuffer()));
  const text = zlib.gunzipSync(gz).toString('utf8').replace(/^﻿/, '');
  console.log('  gedownload:', mb(gz.length), '->', mb(Buffer.byteLength(text)), 'uitgepakt');

  // Regels handmatig splitsen: we hergebruiken de originele tekst per rij, zodat
  // waarden niet opnieuw geserialiseerd hoeven te worden.
  const lines = text.split('\n').filter((l) => l.trim() !== '');
  const header = lines[0];
  const columns = header.split(SEPARATOR);
  const codeIndex = columns.indexOf(MUNICIPALITY_COLUMN);
  if (codeIndex === -1) {
    throw new Error(`Kolom "${MUNICIPALITY_COLUMN}" niet gevonden in de CSV`);
  }

  const perMunicipality = new Map();
  for (let i = 1; i < lines.length; i++) {
    const code = lines[i].split(SEPARATOR)[codeIndex];
    if (!code) continue;
    if (!perMunicipality.has(code)) perMunicipality.set(code, []);
    perMunicipality.get(code).push(lines[i]);
  }

  fs.rmSync(OUTPUT_DIR, { recursive: true, force: true });
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const index = {};
  let totalBytes = 0;
  let largest = { code: null, bytes: 0, rows: 0 };

  for (const [code, rows] of perMunicipality) {
    const content = header + '\n' + rows.join('\n') + '\n';
    const out = zlib.gzipSync(content, { level: 9 });
    fs.writeFileSync(path.join(OUTPUT_DIR, `${code}.csv.gz`), out);
    index[code] = rows.length;
    totalBytes += out.length;
    if (out.length > largest.bytes) largest = { code, bytes: out.length, rows: rows.length };
  }

  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'index.json'),
    JSON.stringify({ separator: SEPARATOR, municipalities: index }, null, 2)
  );

  const rowCount = lines.length - 1;
  const indexed = Object.values(index).reduce((a, b) => a + b, 0);

  console.log('\nGeschreven naar', path.relative(process.cwd(), OUTPUT_DIR));
  console.log('  gemeenten:      ', perMunicipality.size);
  console.log('  buurten:        ', indexed, indexed === rowCount ? '(alle rijen verwerkt)' : `LET OP: bron had er ${rowCount}`);
  console.log('  totaal gzipped: ', mb(totalBytes));
  console.log('  gemiddeld:      ', mb(totalBytes / perMunicipality.size), 'per gemeente');
  console.log('  grootste:       ', largest.code, mb(largest.bytes), `(${largest.rows} buurten)`);
}

main().catch((error) => {
  console.error('Mislukt:', error.message);
  process.exit(1);
});
