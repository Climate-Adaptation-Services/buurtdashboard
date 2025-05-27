import { allMunicipalitiesJSONData, allNeighbourhoodsJSONData, neighbourhoodCodeAbbreviation } from "$lib/stores"
import { get } from 'svelte/store'
import * as topojsonsimplify from "topojson-simplify";
import * as topojson from "topojson-client";

export function prepareJSONData(JSONdata, CSVdata) {
  console.log('CSVdata', CSVdata)

  let municipalityTopojson = topojsonsimplify.presimplify(JSONdata[0])
  municipalityTopojson = topojson.feature(municipalityTopojson, municipalityTopojson.objects.GemeenteGrenzen2023)
  allMunicipalitiesJSONData.set(municipalityTopojson)

  let neighbourhoodTopojson = topojsonsimplify.presimplify(JSONdata[1])
  neighbourhoodTopojson = topojson.feature(neighbourhoodTopojson, neighbourhoodTopojson.objects['Buurt2024BuurtdashboardDataset20250425'])
  let neighbourhoodTopojsonFeatures = neighbourhoodTopojson.features

  // Get the code abbreviation once to avoid repeated store access
  const codeAbbreviation = get(neighbourhoodCodeAbbreviation);
  
  neighbourhoodTopojsonFeatures = neighbourhoodTopojsonFeatures.map(neighbourhood => {
    // Get the neighborhood code
    const neighborhoodCode = neighbourhood.properties[codeAbbreviation];
    
    // Find matching CSV data
    const matchingCSVData = CSVdata.filter(nbh => nbh[codeAbbreviation] === neighborhoodCode)[0];
    
    // If we found a match, use it; otherwise, keep the original properties
    if (matchingCSVData) {
      neighbourhood.properties = matchingCSVData;
    }

    neighbourhood.properties['m2GroenPI'] = (isNaN(parseFloat(neighbourhood.properties['m2GroenPI']))) ? null : parseFloat(neighbourhood.properties['m2GroenPI'])

    // verschillende variabelen van string naar num
    neighbourhood.properties['F1865ErnsOv'] = (isNaN(parseFloat(neighbourhood.properties['F1865ErnsOv']))) ? null : parseFloat(neighbourhood.properties['F1865ErnsOv'])
    neighbourhood.properties['F18ErnstigZ'] = (isNaN(parseFloat(neighbourhood.properties['F18ErnstigZ']))) ? null : parseFloat(neighbourhood.properties['F18ErnstigZ'])
    neighbourhood.properties['BrozeGezon'] = (isNaN(parseFloat(neighbourhood.properties['BrozeGezon']))) ? null : parseFloat(neighbourhood.properties['BrozeGezon'])
    neighbourhood.properties['G_WOZ'] = (isNaN(parseFloat(neighbourhood.properties['G_WOZ']))) ? null : parseFloat(neighbourhood.properties['G_WOZ'])
    neighbourhood.properties['HuurwTperc'] = (isNaN(parseFloat(neighbourhood.properties['HuurwTperc']))) ? null : parseFloat(neighbourhood.properties['HuurwTperc'])
    neighbourhood.properties['perc_groen_zonder_agr'] = (isNaN(parseFloat(neighbourhood.properties['perc_groen_zonder_agr']))) ? null : parseFloat(neighbourhood.properties['perc_groen_zonder_agr'])

    if (neighbourhood.properties['BEV_DICHTH'] < 0) {
      neighbourhood.properties['BEV_DICHTH'] = null
    }
    return neighbourhood
  })

  console.log('allNeighbourhoodsJSONData', { type: 'FeatureCollection', features: neighbourhoodTopojsonFeatures })
  allNeighbourhoodsJSONData.set({ type: 'FeatureCollection', features: neighbourhoodTopojsonFeatures })
}