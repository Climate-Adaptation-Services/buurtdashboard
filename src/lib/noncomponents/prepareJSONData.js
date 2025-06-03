import { allMunicipalitiesJSONData, allNeighbourhoodsJSONData, neighbourhoodCodeAbbreviation } from "$lib/stores"
import { get } from 'svelte/store'
import * as topojsonsimplify from "topojson-simplify";
import * as topojson from "topojson-client";

export function prepareJSONData(JSONdata, CSVdata) {
  // 1. Process municipality data (this is fast, no optimization needed)
  let municipalityTopojson = topojsonsimplify.presimplify(JSONdata[0])
  municipalityTopojson = topojson.feature(municipalityTopojson, municipalityTopojson.objects.GemeenteGrenzen2023)
  allMunicipalitiesJSONData.set(municipalityTopojson)

  // 2. Process neighborhood data with optimizations

  // Initialize features array
  let neighbourhoodTopojsonFeatures = [];

  try {
    // Check if data is in the expected format for TopoJSON processing
    let neighbourhoodTopojson = JSONdata[1];

    if (neighbourhoodTopojson && neighbourhoodTopojson.objects) {
      // It's a TopoJSON, process it with simplification
      const objectName = Object.keys(neighbourhoodTopojson.objects)[0];

      // Apply topology-preserving simplification with a moderate tolerance
      neighbourhoodTopojson = topojsonsimplify.presimplify(neighbourhoodTopojson);
      neighbourhoodTopojson = topojsonsimplify.simplify(neighbourhoodTopojson, 0.0001); // Small value preserves most details
      neighbourhoodTopojson = topojson.feature(neighbourhoodTopojson, neighbourhoodTopojson.objects[objectName]);
      neighbourhoodTopojsonFeatures = neighbourhoodTopojson.features;
    } else if (neighbourhoodTopojson && neighbourhoodTopojson.type === 'FeatureCollection') {
      // It's already a GeoJSON FeatureCollection, use features directly
      console.warn('Neighborhood data is already GeoJSON, skipping TopoJSON processing');
      neighbourhoodTopojsonFeatures = neighbourhoodTopojson.features || [];
    } else {
      console.error('Neighborhood data in unexpected format', neighbourhoodTopojson);
      neighbourhoodTopojsonFeatures = [];
    }
  } catch (error) {
    console.error('Error processing neighborhood data:', error);
    neighbourhoodTopojsonFeatures = [];
  }

  // 3. Create a fast lookup table for CSV data instead of using filter
  const csvLookup = {};
  CSVdata.forEach(item => {
    if (item[get(neighbourhoodCodeAbbreviation)]) {
      csvLookup[item[get(neighbourhoodCodeAbbreviation)]] = item;
    }
  });


  // 4. Pre-define the numeric properties to convert for better performance
  const numericProperties = [
    'm2GroenPI', 'F1865ErnsOv', 'F18ErnstigZ', 'BrozeGezon',
    'G_WOZ', 'HuurwTperc', 'perc_groen_zonder_agr'
  ];

  // 5. Process all neighborhoods in a single pass with optimized lookups
  neighbourhoodTopojsonFeatures = neighbourhoodTopojsonFeatures.map(neighbourhood => {
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

    return neighbourhood;
  });


  // Set the final GeoJSON data
  allNeighbourhoodsJSONData.set({ type: 'FeatureCollection', features: neighbourhoodTopojsonFeatures })
}