import { allMunicipalitiesJSONData, allNeighbourhoodsJSONData } from "$lib/stores"
import * as topojsonsimplify from "topojson-simplify";
import * as topojson from "topojson-client";

export function prepareJSONData(JSONdata){
  console.log('JSONdata', JSONdata)
  let municipalityTopojson = topojsonsimplify.presimplify(JSONdata[0])
  municipalityTopojson = topojson.feature(municipalityTopojson, municipalityTopojson.objects.GemeenteGrenzen2023)
  allMunicipalitiesJSONData.set(municipalityTopojson)

  let neighbourhoodTopojson1 = topojsonsimplify.presimplify(JSONdata[1])
  neighbourhoodTopojson1 = topojson.feature(neighbourhoodTopojson1, neighbourhoodTopojson1.objects['BuurtenDataset20240913_xaaaa'])

  let neighbourhoodTopojson2 = topojsonsimplify.presimplify(JSONdata[2])
  neighbourhoodTopojson2 = topojson.feature(neighbourhoodTopojson2, neighbourhoodTopojson2.objects['BuurtenDataset20240913_xaaab'])
  
  let neighbourhoodTopojson3 = topojsonsimplify.presimplify(JSONdata[3])
  neighbourhoodTopojson3 = topojson.feature(neighbourhoodTopojson3, neighbourhoodTopojson3.objects['BuurtenDataset20240913_xaaac'])
  
  let combinedBuurt = [...neighbourhoodTopojson1.features, ...neighbourhoodTopojson2.features, ...neighbourhoodTopojson3.features]

  combinedBuurt = combinedBuurt.map(neighbourhood => {

    neighbourhood.properties['m2GroenPI'] = (isNaN(parseFloat(neighbourhood.properties['m2GroenPI']))) ? null : parseFloat(neighbourhood.properties['m2GroenPI'])

    // verschillende variabelen van string naar num
    neighbourhood.properties['F1865ErnsOv'] = (isNaN(parseFloat(neighbourhood.properties['F1865ErnsOv']))) ? null : parseFloat(neighbourhood.properties['F1865ErnsOv'])
    neighbourhood.properties['F18ErnstigZ'] = (isNaN(parseFloat(neighbourhood.properties['F18ErnstigZ']))) ? null : parseFloat(neighbourhood.properties['F18ErnstigZ'])
    neighbourhood.properties['BrozeGezon'] = (isNaN(parseFloat(neighbourhood.properties['BrozeGezon']))) ? null : parseFloat(neighbourhood.properties['BrozeGezon'])
    neighbourhood.properties['G_WOZ'] = (isNaN(parseFloat(neighbourhood.properties['G_WOZ']))) ? null : parseFloat(neighbourhood.properties['G_WOZ'])
    neighbourhood.properties['HuurwTperc'] = (isNaN(parseFloat(neighbourhood.properties['HuurwTperc']))) ? null : parseFloat(neighbourhood.properties['HuurwTperc'])
    neighbourhood.properties['perc_groen_zonder_agr'] = (isNaN(parseFloat(neighbourhood.properties['perc_groen_zonder_agr']))) ? null : parseFloat(neighbourhood.properties['perc_groen_zonder_agr'])

    if(neighbourhood.properties['BEV_DICHTH'] < 0){
      neighbourhood.properties['BEV_DICHTH'] = null
    } 

    return neighbourhood
  })

  console.log('allNeighbourhoodsJSONData', {type: 'FeatureCollection', features: combinedBuurt})
  allNeighbourhoodsJSONData.set({type: 'FeatureCollection', features: combinedBuurt})
}