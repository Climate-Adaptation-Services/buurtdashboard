import { allMunicipalitiesJSONData, allNeighbourhoodsJSONData, neighbourhoodCodeAbbreviation } from "$lib/stores"
import { get } from 'svelte/store'
import * as topojsonsimplify from "topojson-simplify";
import * as topojson from "topojson-client";
import { getFromCache, saveToCache } from "./cacheUtils";

// Module-level flag to track if data has been processed
// Set to false on each import to ensure data is processed when JSON changes
let hasProcessedData = false;

// Performance measurement utility
function measurePerformance(label, fn) {
  const start = performance.now();
  const result = fn();
  const end = performance.now();
  // Performance logging removed for production
  return result;
}

/**
 * Process TopoJSON data with caching for improved performance
 * @param {Array} JSONdata - Array containing municipality and neighborhood TopoJSON data
 * @param {Array} CSVdata - CSV data for neighborhoods
 * @param {Object} options - Optional parameters including source URLs for caching
 */
export async function prepareJSONData(JSONdata, CSVdata, options = {}) {
  // Reset flag to ensure data is processed when JSON changes
  hasProcessedData = false;



  // Mark as processed at the beginning to prevent race conditions
  hasProcessedData = true;
  const totalStart = performance.now();
  const { municipalityUrl, neighbourhoodUrl } = options;

  // 1. Process municipality data with caching
  let municipalityTopojson;
  let municipalityCached = false;

  if (municipalityUrl) {
    // Try to get processed municipality data from cache
    const cachedData = await getFromCache(municipalityUrl);
    if (cachedData) {

      municipalityTopojson = cachedData;
      municipalityCached = true;
    }
  }

  // If not cached, process the data
  if (!municipalityCached) {
    municipalityTopojson = measurePerformance('Municipality TopoJSON processing', () => {
      // Apply presimplify and convert to feature
      let topoData = topojsonsimplify.presimplify(JSONdata[0]);
      return topojson.feature(topoData, topoData.objects.GemeenteGrenzen2023);
    });

    // Cache the processed data if URL is provided
    if (municipalityUrl) {
      saveToCache(municipalityUrl, municipalityTopojson);
    }
  }

  allMunicipalitiesJSONData.set(municipalityTopojson)

  // 2. Process neighborhood data with caching and optimizations

  // Initialize features array
  let neighbourhoodTopojsonFeatures = [];
  let neighbourhoodCached = false;

  try {
    // Try to get processed neighborhood data from cache
    if (neighbourhoodUrl) {
      const cachedData = await getFromCache(neighbourhoodUrl);
      if (cachedData && cachedData.features) {

        neighbourhoodTopojsonFeatures = cachedData.features;
        neighbourhoodCached = true;
      }
    }

    // If not cached, process the data
    if (!neighbourhoodCached) {
      neighbourhoodTopojsonFeatures = measurePerformance('Neighborhood TopoJSON processing', () => {
        // Check if data is in the expected format for TopoJSON processing
        let neighbourhoodTopojson = JSONdata[1];

        if (neighbourhoodTopojson && neighbourhoodTopojson.objects) {
          // It's a TopoJSON
          const objectName = Object.keys(neighbourhoodTopojson.objects)[0];


          // Apply topology-preserving simplification with a moderate tolerance
          neighbourhoodTopojson = topojsonsimplify.presimplify(neighbourhoodTopojson);
          neighbourhoodTopojson = topojsonsimplify.simplify(neighbourhoodTopojson, 0.00001); // Small value preserves most details
          neighbourhoodTopojson = topojson.feature(neighbourhoodTopojson, neighbourhoodTopojson.objects[objectName]);
          return neighbourhoodTopojson.features;
        } else if (neighbourhoodTopojson && neighbourhoodTopojson.type === 'FeatureCollection') {
          // It's already a GeoJSON FeatureCollection, use features directly
          console.warn('Neighborhood data is already GeoJSON, skipping TopoJSON processing');
          return neighbourhoodTopojson.features || [];
        } else {
          console.error('Neighborhood data in unexpected format', neighbourhoodTopojson);
          return [];
        }
      });

      // Cache the processed data if URL is provided
      if (neighbourhoodUrl) {
        const featureCollection = { type: 'FeatureCollection', features: neighbourhoodTopojsonFeatures };
        saveToCache(neighbourhoodUrl, featureCollection);
      }
    }
  } catch (error) {
    console.error('Error processing neighborhood data:', error);
    neighbourhoodTopojsonFeatures = [];
  }

  // 3. Create a fast lookup table for CSV data instead of using filter
  const csvLookup = measurePerformance('CSV lookup creation', () => {
    const lookup = {};
    CSVdata.forEach(item => {
      if (item[get(neighbourhoodCodeAbbreviation)]) {
        lookup[item[get(neighbourhoodCodeAbbreviation)]] = item;
      }
    });
    return lookup;
  });


  // 4. Pre-define the numeric properties to convert
  const numericProperties = [
    'm2GroenPI', 'F1865ErnsOv', 'F18ErnstigZ', 'BrozeGezon',
    'G_WOZ', 'HuurwTperc', 'perc_groen_zonder_agr'
  ];

  // 5. Process all neighborhoods in a single pass with optimized lookups
  neighbourhoodTopojsonFeatures = measurePerformance('Neighborhood data mapping', () => {
    return neighbourhoodTopojsonFeatures.map(neighbourhood => {
      // Get the neighborhood code
      const neighborhoodCode = neighbourhood.properties[get(neighbourhoodCodeAbbreviation)];

      // Use direct lookup instead of filter (much faster)
      const matchingCSVData = csvLookup[neighborhoodCode];
      // If we found a match, use it; otherwise, keep the original properties
      if (matchingCSVData) {
        neighbourhood.properties = matchingCSVData;
      }

      // Convert all numeric properties in a single loop
      numericProperties.forEach(prop => {
        if (neighbourhood.properties[prop] !== undefined) {
          neighbourhood.properties[prop] = (isNaN(parseFloat(neighbourhood.properties[prop])))
            ? null
            : parseFloat(neighbourhood.properties[prop]);
        }
      });

      // Special case for BEV_DICHTH
      if (neighbourhood.properties['BEV_DICHTH'] < 0) {
        neighbourhood.properties['BEV_DICHTH'] = null;
      }

      // Special case for Waterdiepte bij hevige bui
      ['perc5_10mm', 'perc10_15mm', 'perc15_20mm', 'perc20_30mm', 'perc30mmME', 'percNODATA'].forEach(attribute => {
        neighbourhood.properties[attribute] *= 100;
      });


      return neighbourhood;
    });
  });

  // Set the final GeoJSON data
  measurePerformance('Set final GeoJSON data', () => {
    allNeighbourhoodsJSONData.set({ type: 'FeatureCollection', features: neighbourhoodTopojsonFeatures })
  });
}