#!/usr/bin/env node
/**
 * Pre-calculation script for Nederland (Netherlands) aggregate values
 *
 * This script:
 * 1. Fetches all necessary data (metadata, CSV, GeoJSON)
 * 2. Processes indicators
 * 3. Calculates Nederland aggregate values (median or weighted average)
 * 4. Saves results to static/nederland-aggregates.json
 *
 * Run this script whenever dataset updates occur in datasets.ts
 * Usage: npm run precalculate-nederland
 */

import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { dsvFormat } from 'd3-dsv';
import { gunzipSync, unzipSync, strFromU8 } from 'fflate';
import { feature } from 'topojson-client';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Import dataset configuration
const DATASET_VERSION = '20250619';
const BUURT_GEOJSON_URL = "https://buurtdashboard-data.s3.eu-north-1.amazonaws.com/buurtdashboard-KEA/geojsondata/buurt24IdentificationOnly.json";
const DEFAULT_METADATA_URL = "https://buurtdashboard-data.s3.eu-north-1.amazonaws.com/buurtdashboard-KEA/metadata/TESTBASISKAARTGROEN-metadata-buurtdashboard(in)(3).csv";
const DEFAULT_CSV_DATA_URL = "https://buurtdashboard-data.s3.eu-north-1.amazonaws.com/buurtdashboard-KEA/csvdata/basiskaartGroen211025(b10Buurt2024BasiskaartGroen).csv.gz";

// Calculation utilities (copied from calcMedian.js)
function calcMedian(array) {
  if (!array || array.length === 0) {
    return null;
  }

  const OnlyNumbers = array
    .filter(d => d !== null && d !== undefined && !isNaN(+d) && isFinite(+d))
    .map(d => +d);

  if (OnlyNumbers.length === 0) {
    return null;
  }

  OnlyNumbers.sort((a, b) => a - b);
  const length = OnlyNumbers.length;

  if (length % 2 === 0) {
    return (OnlyNumbers[length / 2] + OnlyNumbers[(length / 2) - 1]) / 2;
  } else {
    return OnlyNumbers[Math.floor(length / 2)];
  }
}

function calcWeightedAverage(features, valueExtractor, surfaceAreaColumn) {
  if (!features || features.length === 0 || !surfaceAreaColumn) {
    return null;
  }

  let totalWeightedSum = 0;
  let totalSurfaceArea = 0;
  let validCount = 0;

  features.forEach(feature => {
    const value = valueExtractor(feature);
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

  if (totalSurfaceArea === 0) {
    return null;
  }

  return totalWeightedSum / totalSurfaceArea;
}

// Setup indicators (simplified from setupIndicators.js)
function setupIndicators(metadata) {
  const indicatorsList = [];

  metadata.forEach(indicator => {
    if (indicator.Titel === '') return;

    const classes = {};
    const indicatorDomein = ['No data', ...indicator.Domein.split(',')];

    if (indicator['kwantitatief / categoraal / aggregated'] !== 'categoraal') {
      indicatorDomein.slice(1).forEach((d, i) => {
        classes[d] = indicator.Indicatornaamtabel.split(',')[i];
      });
    } else {
      indicatorDomein.slice(1).forEach((d, i) => {
        classes[d] = indicator.klassenthresholds.split(',')[i];
      });
    }

    indicatorsList.push({
      title: indicator.Titel,
      attribute: indicator.Indicatornaamtabel.split(',')[0],
      numerical: (indicator['kwantitatief / categoraal / aggregated'] === 'kwantitatief') ? true : false,
      aggregatedIndicator: (indicator['kwantitatief / categoraal / aggregated'] === 'aggregated') ? true : false,
      surfaceArea: indicator['Oppervlakte'],
      variants: indicator.Varianten,
      classes: classes
    });
  });

  return indicatorsList;
}

// Get available years for an indicator
function getAvailableYears(csvData, attributeBase) {
  const years = new Set();
  const columns = Object.keys(csvData[0] || {});

  columns.forEach(col => {
    if (col.startsWith(attributeBase)) {
      const match = col.match(/_(\d{4})$/);
      if (match) {
        years.add(match[1]);
      }
    }
  });

  return Array.from(years).sort();
}

// Prepare JSON data (simplified from prepareJSONData.js)
function prepareJSONData(geoJson, csvData) {
  if (!geoJson || !csvData) {
    console.error('Missing geoJson or csvData');
    return null;
  }

  if (!geoJson.features || !Array.isArray(geoJson.features)) {
    console.error('Invalid geoJson structure:', Object.keys(geoJson));
    return null;
  }

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

  return {
    type: 'FeatureCollection',
    features
  };
}

// Calculate Nederland aggregate for a single indicator
function calculateNederlandAggregate(indicator, jsonData, year = null) {
  const features = jsonData.features;

  // Determine the attribute name with year suffix if applicable
  let attributeName = indicator.attribute;
  if (year) {
    attributeName = `${indicator.attribute}_${year}`;
  }

  if (indicator.numerical) {
    // For numerical indicators
    const valueExtractor = (feature) => {
      const value = feature.properties[attributeName];
      return (value !== null && value !== undefined && value !== '' && !isNaN(value)) ? +value : null;
    };

    if (indicator.surfaceArea) {
      // Use weighted average
      let surfaceAreaColumn = indicator.surfaceArea;

      // Handle BEB variants (bebouwde kom)
      if (indicator.variants && indicator.variants.split(',').map(v => v.trim()).includes('1')) {
        // For BEB variant, we'd need the store value, but for pre-calculation we'll use base
        // The UI will handle BEB selection dynamically
      }

      return calcWeightedAverage(features, valueExtractor, surfaceAreaColumn);
    } else {
      // Use median
      const values = features
        .map(valueExtractor)
        .filter(v => v !== null);
      return calcMedian(values);
    }
  } else if (indicator.aggregatedIndicator) {
    // For aggregated indicators, calculate for each class
    const result = {};
    Object.keys(indicator.classes).forEach(className => {
      const classAttribute = year ? `${indicator.classes[className]}_${year}` : indicator.classes[className];
      const valueExtractor = (feature) => {
        const value = feature.properties[classAttribute];
        return (value !== null && value !== undefined && value !== '' && !isNaN(value)) ? +value : null;
      };

      if (indicator.surfaceArea) {
        result[className] = calcWeightedAverage(features, valueExtractor, indicator.surfaceArea);
      } else {
        const values = features.map(valueExtractor).filter(v => v !== null);
        result[className] = calcMedian(values);
      }
    });
    return result;
  } else {
    // For categorical indicators, we can't really pre-calculate a single value
    // Return null for now - these will be calculated dynamically
    return null;
  }
}

// Main function
async function main() {
  console.log('🚀 Starting Nederland aggregates pre-calculation...');
  console.log(`📦 Dataset version: ${DATASET_VERSION}`);

  try {
    // 1. Fetch all data
    console.log('\n📥 Fetching data...');
    const [metadataResponse, geoJsonResponse, csvResponse] = await Promise.all([
      fetch(DEFAULT_METADATA_URL),
      fetch(BUURT_GEOJSON_URL),
      fetch(DEFAULT_CSV_DATA_URL)
    ]);

    // 2. Process metadata
    console.log('📊 Processing metadata...');
    const metadataText = await metadataResponse.text();
    const metadata = dsvFormat(';').parse(metadataText);

    // 3. Process CSV
    console.log('📄 Processing CSV data...');
    const zipBuffer = await csvResponse.arrayBuffer();
    let csvText;
    if (DEFAULT_CSV_DATA_URL.endsWith('.gz')) {
      const decompressed = gunzipSync(new Uint8Array(zipBuffer));
      csvText = strFromU8(decompressed);
    } else {
      const files = unzipSync(new Uint8Array(zipBuffer));
      const fileName = Object.keys(files).find(name => name.endsWith('.csv'));
      csvText = strFromU8(files[fileName]);
    }
    const csvData = dsvFormat(';').parse(csvText);

    // 4. Process GeoJSON (convert from TopoJSON if needed)
    console.log('🗺️  Processing GeoJSON...');
    const topoJson = await geoJsonResponse.json();

    // Convert TopoJSON to GeoJSON
    let geoJson;
    if (topoJson.type === 'Topology') {
      // It's TopoJSON, convert to GeoJSON
      const objectKey = Object.keys(topoJson.objects)[0];
      geoJson = feature(topoJson, topoJson.objects[objectKey]);
    } else {
      // Already GeoJSON
      geoJson = topoJson;
    }

    const jsonData = prepareJSONData(geoJson, csvData);

    // 5. Setup indicators
    console.log('🔧 Setting up indicators...');
    const indicators = setupIndicators(metadata);
    console.log(`   Found ${indicators.length} indicators`);

    // 6. Calculate Nederland aggregates
    console.log('\n🧮 Calculating Nederland aggregates...');
    const nederlandAggregates = {};

    for (const indicator of indicators) {
      // Get available years for this indicator
      const years = getAvailableYears(csvData, indicator.attribute);
      console.log(`   Processing: ${indicator.title} (${years.length > 0 ? years.join(', ') : 'single value'})`);

      if (years.length > 0) {
        // Multi-year indicator
        nederlandAggregates[indicator.title] = {};
        for (const year of years) {
          const value = calculateNederlandAggregate(indicator, jsonData, year);
          if (value !== null) {
            nederlandAggregates[indicator.title][year] = value;
          }
        }
        // Only add to aggregates if we got at least one year's data
        if (Object.keys(nederlandAggregates[indicator.title]).length === 0) {
          delete nederlandAggregates[indicator.title];
        }
      } else {
        // Single value indicator
        const value = calculateNederlandAggregate(indicator, jsonData);
        if (value !== null) {
          nederlandAggregates[indicator.title] = value;
        }
      }
    }

    // 7. Save to file
    const outputPath = join(__dirname, '..', 'static', 'nederland-aggregates.json');
    const output = {
      version: DATASET_VERSION,
      generatedAt: new Date().toISOString(),
      aggregates: nederlandAggregates
    };

    // Ensure static directory exists
    mkdirSync(join(__dirname, '..', 'static'), { recursive: true });

    writeFileSync(outputPath, JSON.stringify(output, null, 2), 'utf-8');

    console.log('\n✅ Success!');
    console.log(`   Aggregates saved to: static/nederland-aggregates.json`);
    console.log(`   Total indicators processed: ${Object.keys(nederlandAggregates).length}`);

  } catch (error) {
    console.error('\n❌ Error:', error);
    process.exit(1);
  }
}

// Run the script
main();
