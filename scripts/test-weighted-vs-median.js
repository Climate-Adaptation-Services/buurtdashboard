#!/usr/bin/env node
/**
 * Test script to compare weighted average vs median for green indicators
 * This verifies our hypothesis that weighted average should be higher than median
 */

import { dsvFormat } from 'd3-dsv';
import { gunzipSync } from 'fflate';
import { strFromU8 } from 'fflate';
import { feature } from 'topojson-client';
import {
  BUURT_GEOJSON_URL,
  DEFAULT_CSV_DATA_URL
} from '../src/lib/datasets.js';

// Calculation functions
function calcMedian(array) {
  if (!array || array.length === 0) return null;

  const OnlyNumbers = array
    .filter(d => d !== null && d !== undefined && !isNaN(+d) && isFinite(+d))
    .map(d => +d);

  if (OnlyNumbers.length === 0) return null;

  OnlyNumbers.sort((a, b) => a - b);
  const length = OnlyNumbers.length;

  if (length % 2 === 0) {
    return (OnlyNumbers[length / 2] + OnlyNumbers[(length / 2) - 1]) / 2;
  } else {
    return OnlyNumbers[Math.floor(length / 2)];
  }
}

function calcWeightedAverage(features, attributeName, surfaceAreaColumn) {
  let totalWeightedSum = 0;
  let totalSurfaceArea = 0;
  let validCount = 0;

  features.forEach(feature => {
    const value = feature.properties?.[attributeName];
    const surfaceArea = feature.properties?.[surfaceAreaColumn];

    if (value !== null && value !== undefined && !isNaN(+value) &&
        surfaceArea !== null && surfaceArea !== undefined && !isNaN(+surfaceArea)) {
      const numValue = +value;
      const numSurfaceArea = +surfaceArea;

      totalWeightedSum += numValue * numSurfaceArea;
      totalSurfaceArea += numSurfaceArea;
      validCount++;
    }
  });

  if (totalSurfaceArea === 0) return null;

  return totalWeightedSum / totalSurfaceArea;
}

function prepareJSONData(geoJson, csvData) {
  const features = geoJson.features.map(feature => {
    const buurtcode = feature.properties.buurtcode2024 || feature.properties.buurtcode;
    const csvRow = csvData.find(row => row.buurtcode2024 === buurtcode || row.buurtcode === buurtcode);

    return {
      ...feature,
      properties: {
        ...feature.properties,
        ...(csvRow || {})
      }
    };
  });

  return { type: 'FeatureCollection', features };
}

// Main test
async function testWeightedVsMedian() {
  console.log('🧪 Testing Weighted Average vs Median for Green Indicators\n');

  try {
    // 1. Fetch data
    console.log('📥 Fetching data...');
    const [geoJsonResponse, csvResponse] = await Promise.all([
      fetch(BUURT_GEOJSON_URL),
      fetch(DEFAULT_CSV_DATA_URL)
    ]);

    // 2. Process CSV
    console.log('📄 Processing CSV data...');
    const zipBuffer = await csvResponse.arrayBuffer();
    const decompressed = gunzipSync(new Uint8Array(zipBuffer));
    const csvText = strFromU8(decompressed);
    const csvData = dsvFormat(';').parse(csvText);

    // 3. Process GeoJSON
    console.log('🗺️  Processing GeoJSON...');
    const topoJson = await geoJsonResponse.json();

    // Convert TopoJSON to GeoJSON if needed
    let geoJson;
    if (topoJson.type === 'Topology') {
      const objectKey = Object.keys(topoJson.objects)[0];
      geoJson = feature(topoJson, topoJson.objects[objectKey]);
    } else {
      geoJson = topoJson;
    }

    const jsonData = prepareJSONData(geoJson, csvData);

    console.log(`   Total neighborhoods: ${jsonData.features.length}\n`);

    // 4. Test green indicators
    const greenIndicators = [
      {
        name: 'Groen (hele buurt)',
        attribute: 'Groen_PercLand',
        surfaceArea: 'Oppervlakte_Land_VSK_m2'
      },
      {
        name: 'Groen openbaar (hele buurt)',
        attribute: 'Groen_Openbaar_PercOpenbaar',
        surfaceArea: 'Oppervlakte_Openbaar_m2'
      },
      {
        name: 'Groen niet-openbaar (hele buurt)',
        attribute: 'Groen_NietOpenbaar_PercNO',
        surfaceArea: 'Oppervlakte_NietOpenbaar_m2'
      },
      {
        name: 'Boomkroonoppervlakte (hele buurt)',
        attribute: 'BKB',
        surfaceArea: 'Oppervlakte_Land_VSK_m2'
      },
      {
        name: 'Boomkroonoppervlakte openbaar (hele buurt)',
        attribute: 'BKB_Openbaar_PercOpenbaar',
        surfaceArea: 'Oppervlakte_Openbaar_m2'
      },
      {
        name: 'Verharding (hele buurt)',
        attribute: 'Verharding_PercLand',
        surfaceArea: 'Oppervlakte_Land_VSK_m2'
      }
    ];

    console.log('📊 Results:\n');
    console.log('Indicator'.padEnd(45) + 'Median'.padEnd(12) + 'Weighted'.padEnd(12) + 'Difference'.padEnd(12) + 'Higher?');
    console.log('='.repeat(90));

    greenIndicators.forEach(indicator => {
      const values = jsonData.features
        .map(f => f.properties?.[indicator.attribute])
        .filter(v => v !== null && v !== undefined && !isNaN(+v))
        .map(v => +v);

      const median = calcMedian(values);
      const weighted = calcWeightedAverage(jsonData.features, indicator.attribute, indicator.surfaceArea);

      if (median !== null && weighted !== null) {
        const diff = weighted - median;
        const higher = weighted > median ? 'Weighted ↑' : weighted < median ? 'Median ↑' : 'Same';
        const diffStr = diff.toFixed(2);

        console.log(
          indicator.name.padEnd(45) +
          median.toFixed(2).padEnd(12) +
          weighted.toFixed(2).padEnd(12) +
          diffStr.padEnd(12) +
          higher
        );
      }
    });

    console.log('\n✅ Test complete!');

  } catch (error) {
    console.error('\n❌ Error:', error);
    process.exit(1);
  }
}

// Run test
testWeightedVsMedian();
