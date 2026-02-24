#!/usr/bin/env node
/**
 * Pre-calculation script for Nederland (Netherlands) aggregate values
 *
 * This script:
 * 1. Fetches all necessary data (indicators config, CSV, GeoJSON)
 * 2. Processes indicators
 * 3. Calculates Nederland aggregate values (median or weighted average)
 * 4. Saves results to static/nederland-aggregates.json
 *
 * Run this script whenever dataset updates occur in data-urls.js
 * Usage: npm run precalculate-nederland
 */

import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { dsvFormat } from 'd3-dsv';
import { gunzipSync, unzipSync, strFromU8 } from 'fflate';
import { feature } from 'topojson-client';

// Import from datasets.js (single source of truth)
import {
  DATASET_VERSION,
  BUURT_GEOJSON_URL,
  DEFAULT_CSV_DATA_URL,
  DEFAULT_INDICATORS_CONFIG_URL
} from '../src/lib/datasets.js';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Dataset configuration imported from datasets.ts
// ⚠️ IMPORTANT: When you update data URLs or version in datasets.ts, you MUST:
// 1. Run this script: npm run precalculate-nederland
//
// The application will automatically detect version mismatches and warn you in the console:
// "Nederland aggregates cache is outdated! Please run: npm run precalculate-nederland"

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

function calcAverage(array) {
  if (!array || array.length === 0) {
    return null;
  }

  const OnlyNumbers = array
    .filter(d => d !== null && d !== undefined && !isNaN(+d) && isFinite(+d))
    .map(d => +d);

  if (OnlyNumbers.length === 0) {
    return null;
  }

  const sum = OnlyNumbers.reduce((acc, val) => acc + val, 0);
  return sum / OnlyNumbers.length;
}

// Setup indicators (simplified from setupIndicators.js)
function setupIndicators(indicatorsConfig) {
  const indicatorsList = [];

  indicatorsConfig.forEach(indicator => {
    if (indicator.Titel === '') return;

    const classes = {};
    const indicatorDomein = ['No data', ...indicator.Domein.split(',')];

    if (indicator['kwantitatief / categoraal / geaggregeerd'] !== 'categoraal') {
      indicatorDomein.slice(1).forEach((d, i) => {
        classes[d] = indicator.Indicatornaamtabel.split(',')[i];
      });
    } else {
      indicatorDomein.slice(1).forEach((d, i) => {
        classes[d] = indicator.klassenthresholds.split(',')[i];
      });
    }

    // Get ALL AHN versions (not just the latest)
    let ahnVersions = [];
    if (indicator.AHNversie && indicator.AHNversie !== '') {
      ahnVersions = indicator.AHNversie.split(',').map(v => v.trim());
    }

    indicatorsList.push({
      title: indicator.Titel,
      attribute: indicator.Indicatornaamtabel.split(',')[0],
      numerical: (indicator['kwantitatief / categoraal / geaggregeerd'] === 'kwantitatief') ? true : false,
      aggregatedIndicator: (indicator['kwantitatief / categoraal / geaggregeerd'] === 'geaggregeerd') ? true : false,
      surfaceArea: indicator['Oppervlakte'],
      variants: indicator.Varianten,
      classes: classes,
      ahnVersions: ahnVersions  // Changed to plural to store all versions
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

// Helper function to build attribute name with proper suffixes
function buildAttributeName(baseAttribute, { year, bebOption, ahnVersion, bebVariant }) {
  let attributeName = baseAttribute;

  // Add year suffix (with underscore)
  if (year) {
    attributeName = `${attributeName}_${year}`;
  }

  // Add AHN suffix
  // Two naming conventions in CSV:
  // - Old-style (PET, etc): no underscore before AHN (e.g., PET29tm34pAHN4)
  // - New-style (BKB, SHD, etc): underscore before AHN (e.g., BKBgraad_Tot_percLand_AHN3)
  if (ahnVersion && ahnVersion !== '') {
    const underscoreCount = (attributeName.match(/_/g) || []).length;
    if (underscoreCount >= 1) {
      // New-style: use underscore
      attributeName = `${attributeName}_${ahnVersion}`;
    } else {
      // Old-style: no underscore
      attributeName = `${attributeName}${ahnVersion}`;
    }
  }

  // Add BEB suffix (with underscore, read from config not hardcoded)
  if (bebOption === 'bebouwde_kom' && bebVariant) {
    attributeName = `${attributeName}_${bebVariant}`;
  }

  return attributeName;
}

// Calculate Nederland aggregate for a single indicator
function calculateNederlandAggregate(indicator, jsonData, year = null, bebOption = null, ahnVersion = null) {
  const features = jsonData.features;

  // Use passed ahnVersion, or fallback to first version in indicator's ahnVersions array
  const effectiveAhnVersion = ahnVersion || (indicator.ahnVersions && indicator.ahnVersions.length > 0 ? indicator.ahnVersions[0] : null);

  // Get the BEB variant from the variants column (not hardcoded)
  const variants = indicator.variants ? indicator.variants.split(',').map(v => v.trim()) : []
  const bebVariant = variants.find(v => v !== 'M2' && v !== '') // Find the BEB variant (not M2)

  // Determine the attribute name with all applicable suffixes
  const attributeName = buildAttributeName(indicator.attribute, {
    year,
    bebOption,
    ahnVersion: effectiveAhnVersion,
    bebVariant
  });

  if (indicator.numerical) {
    // For numerical indicators - use median
    const values = features
      .map(feature => {
        const value = feature.properties[attributeName];
        return (value !== null && value !== undefined && value !== '' && !isNaN(value)) ? +value : null;
      })
      .filter(v => v !== null);
    return calcMedian(values);
  } else if (indicator.aggregatedIndicator) {
    // For aggregated indicators, calculate average for each class
    const result = {};
    Object.keys(indicator.classes).forEach(className => {
      const classAttribute = buildAttributeName(indicator.classes[className], {
        year,
        bebOption,
        ahnVersion: effectiveAhnVersion,
        bebVariant
      });

      const values = features
        .map(feature => {
          const value = feature.properties[classAttribute];
          return (value !== null && value !== undefined && value !== '' && !isNaN(value)) ? +value : null;
        })
        .filter(v => v !== null);

      result[className] = calcAverage(values);
    });

    // Special handling for indicators stored as decimals - multiply by 100
    // The CSV stores values as decimals (0.10667 = 10.667%), but client expects percentages
    const indicatorsNeedingConversion = ['Gevoelstemperatuur', 'Waterdiepte bij hevige bui'];
    if (indicatorsNeedingConversion.includes(indicator.title)) {
      Object.keys(result).forEach(className => {
        if (result[className] !== null && result[className] !== undefined) {
          result[className] = result[className] * 100;
        }
      });
    }

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
    const [indicatorsConfigResponse, geoJsonResponse, csvResponse] = await Promise.all([
      fetch(DEFAULT_INDICATORS_CONFIG_URL),
      fetch(BUURT_GEOJSON_URL),
      fetch(DEFAULT_CSV_DATA_URL)
    ]);

    // 2. Process indicators config
    console.log('📊 Processing indicators config...');
    const indicatorsConfigText = await indicatorsConfigResponse.text();
    const indicatorsConfig = dsvFormat(';').parse(indicatorsConfigText);

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
    let topoJson;
    if (BUURT_GEOJSON_URL.endsWith('.gz')) {
      const geoBuffer = await geoJsonResponse.arrayBuffer();
      const decompressed = gunzipSync(new Uint8Array(geoBuffer));
      topoJson = JSON.parse(strFromU8(decompressed));
    } else {
      topoJson = await geoJsonResponse.json();
    }

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
    const indicators = setupIndicators(indicatorsConfig);
    console.log(`   Found ${indicators.length} indicators`);

    // 6. Calculate Nederland aggregates
    console.log('\n🧮 Calculating Nederland aggregates...');
    const nederlandAggregates = {};

    for (const indicator of indicators) {
      // Get the BEB variant from the variants column (not hardcoded)
      const variants = indicator.variants ? indicator.variants.split(',').map(v => v.trim()) : []
      const bebVariant = variants.find(v => v !== 'M2' && v !== '') // Find the BEB variant (not M2)
      const hasBEBVariant = !!bebVariant;

      // Get available years for this indicator
      const years = getAvailableYears(csvData, indicator.attribute);

      // Check if indicator has AHN versions
      const hasAHNVersions = indicator.ahnVersions && indicator.ahnVersions.length > 0;

      console.log(`   Processing: ${indicator.title} (${years.length > 0 ? years.join(', ') : 'single value'}${hasBEBVariant ? ', BEB' : ''}${hasAHNVersions ? `, AHN: ${indicator.ahnVersions.join(', ')}` : ''})`);

      if (hasBEBVariant && hasAHNVersions) {
        // BEB variant indicator WITH AHN versions - calculate for both hele_buurt and bebouwde_kom, per AHN version
        nederlandAggregates[indicator.title] = {
          hele_buurt: {},
          bebouwde_kom: {}
        };

        const bebOptions = ['hele_buurt', 'bebouwde_kom'];

        for (const bebOption of bebOptions) {
          nederlandAggregates[indicator.title][bebOption] = {};

          // Calculate values for each AHN version
          for (const ahnVersion of indicator.ahnVersions) {
            const indicatorWithAHN = { ...indicator, ahnVersions: [ahnVersion] };
            const value = calculateNederlandAggregate(indicatorWithAHN, jsonData, null, bebOption, ahnVersion);
            if (value !== null) {
              nederlandAggregates[indicator.title][bebOption][ahnVersion] = value;
            }
          }

          // Calculate differences between AHN versions for this BEB option
          const ahnVersionsWithData = indicator.ahnVersions.filter(v =>
            nederlandAggregates[indicator.title][bebOption][v] !== undefined
          );

          if (ahnVersionsWithData.length >= 2 && indicator.numerical) {
            for (let i = 0; i < ahnVersionsWithData.length; i++) {
              for (let j = i + 1; j < ahnVersionsWithData.length; j++) {
                const baseAHN = ahnVersionsWithData[i];
                const compareAHN = ahnVersionsWithData[j];
                const diffKey = `diff_${baseAHN}_${compareAHN}`;

                // Calculate difference for each neighbourhood, then take median
                const differences = jsonData.features
                  .map(feature => {
                    const baseAttr = buildAttributeName(indicator.attribute, {
                      ahnVersion: baseAHN,
                      bebOption,
                      bebVariant
                    });
                    const compareAttr = buildAttributeName(indicator.attribute, {
                      ahnVersion: compareAHN,
                      bebOption,
                      bebVariant
                    });
                    const baseValue = feature.properties[baseAttr];
                    const compareValue = feature.properties[compareAttr];

                    if (baseValue !== null && baseValue !== undefined && baseValue !== '' && !isNaN(baseValue) &&
                        compareValue !== null && compareValue !== undefined && compareValue !== '' && !isNaN(compareValue)) {
                      return +compareValue - +baseValue;
                    }
                    return null;
                  })
                  .filter(v => v !== null);

                const diffMedian = calcMedian(differences);
                if (diffMedian !== null) {
                  nederlandAggregates[indicator.title][bebOption][diffKey] = diffMedian;
                }
              }
            }
          }
        }

        // Clean up completely empty entries
        const helebuurtEmpty =
          (nederlandAggregates[indicator.title].hele_buurt === undefined) ||
          (typeof nederlandAggregates[indicator.title].hele_buurt === 'object' &&
           Object.keys(nederlandAggregates[indicator.title].hele_buurt).length === 0);
        const bebouwdekomEmpty =
          (nederlandAggregates[indicator.title].bebouwde_kom === undefined) ||
          (typeof nederlandAggregates[indicator.title].bebouwde_kom === 'object' &&
           Object.keys(nederlandAggregates[indicator.title].bebouwde_kom).length === 0);

        if (helebuurtEmpty && bebouwdekomEmpty) {
          delete nederlandAggregates[indicator.title];
        }
      } else if (hasBEBVariant) {
        // BEB variant indicator WITHOUT AHN versions - calculate for both hele_buurt and bebouwde_kom
        nederlandAggregates[indicator.title] = {
          hele_buurt: {},
          bebouwde_kom: {}
        };

        const bebOptions = ['hele_buurt', 'bebouwde_kom'];

        for (const bebOption of bebOptions) {
          if (years.length > 0) {
            // Multi-year BEB indicator
            nederlandAggregates[indicator.title][bebOption] = {};
            for (const year of years) {
              const value = calculateNederlandAggregate(indicator, jsonData, year, bebOption);
              if (value !== null) {
                nederlandAggregates[indicator.title][bebOption][year] = value;
              }
            }
          } else {
            // Single value BEB indicator
            const value = calculateNederlandAggregate(indicator, jsonData, null, bebOption);
            console.log(`  ${bebOption}: ${value}`);
            if (value !== null && value !== undefined) {
              nederlandAggregates[indicator.title][bebOption] = value;
            }
          }
        }

        // Clean up completely empty entries
        const helebuurtEmpty =
          (nederlandAggregates[indicator.title].hele_buurt === undefined) ||
          (typeof nederlandAggregates[indicator.title].hele_buurt === 'object' &&
           Object.keys(nederlandAggregates[indicator.title].hele_buurt).length === 0);
        const bebouwdekomEmpty =
          (nederlandAggregates[indicator.title].bebouwde_kom === undefined) ||
          (typeof nederlandAggregates[indicator.title].bebouwde_kom === 'object' &&
           Object.keys(nederlandAggregates[indicator.title].bebouwde_kom).length === 0);

        if (helebuurtEmpty && bebouwdekomEmpty) {
          delete nederlandAggregates[indicator.title];
        }
      } else if (hasAHNVersions) {
        // Indicator with AHN versions (e.g., Gevoelstemperatuur)
        nederlandAggregates[indicator.title] = {};
        for (const ahnVersion of indicator.ahnVersions) {
          // Create a modified indicator with single AHN version for calculation
          const indicatorWithAHN = { ...indicator, ahnVersions: [ahnVersion] };
          const value = calculateNederlandAggregate(indicatorWithAHN, jsonData, null, null, ahnVersion);
          if (value !== null) {
            nederlandAggregates[indicator.title][ahnVersion] = value;
          }
        }

        // Calculate differences between AHN versions
        const ahnVersionsWithData = indicator.ahnVersions.filter(v => nederlandAggregates[indicator.title][v] !== undefined);
        if (ahnVersionsWithData.length >= 2 && indicator.numerical) {
          // For numerical indicators, calculate median of differences
          for (let i = 0; i < ahnVersionsWithData.length; i++) {
            for (let j = i + 1; j < ahnVersionsWithData.length; j++) {
              const baseAHN = ahnVersionsWithData[i];
              const compareAHN = ahnVersionsWithData[j];
              const diffKey = `diff_${baseAHN}_${compareAHN}`;

              // Calculate difference for each neighbourhood, then take median
              const differences = jsonData.features
                .map(feature => {
                  const baseAttr = buildAttributeName(indicator.attribute, { ahnVersion: baseAHN });
                  const compareAttr = buildAttributeName(indicator.attribute, { ahnVersion: compareAHN });
                  const baseValue = feature.properties[baseAttr];
                  const compareValue = feature.properties[compareAttr];

                  if (baseValue !== null && baseValue !== undefined && baseValue !== '' && !isNaN(baseValue) &&
                      compareValue !== null && compareValue !== undefined && compareValue !== '' && !isNaN(compareValue)) {
                    return +compareValue - +baseValue;
                  }
                  return null;
                })
                .filter(v => v !== null);

              const diffMedian = calcMedian(differences);
              if (diffMedian !== null) {
                nederlandAggregates[indicator.title][diffKey] = diffMedian;
              }
            }
          }
        }

        // Only add to aggregates if we got at least one version's data
        if (Object.keys(nederlandAggregates[indicator.title]).length === 0) {
          delete nederlandAggregates[indicator.title];
        }
      } else if (years.length > 0) {
        // Multi-year indicator (no BEB, no AHN)
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
        // Single value indicator (no BEB, no years, no AHN)
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
