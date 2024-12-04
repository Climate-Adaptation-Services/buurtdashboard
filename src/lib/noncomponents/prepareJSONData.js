import { allMunicipalitiesJSONData, allNeighbourhoodsJSONData } from "$lib/stores"
import * as topojsonsimplify from "topojson-simplify";
import * as topojson from "topojson-client";

export function prepareJSONData(JSONdata){
  console.log('JSONdata', JSONdata)

  let municipalityTopojson = topojsonsimplify.presimplify(JSONdata[0])
  municipalityTopojson = topojson.feature(municipalityTopojson, municipalityTopojson.objects.GemeenteGrenzen2023)
  allMunicipalitiesJSONData.set(municipalityTopojson)

  let neighbourhoodTopojson = topojsonsimplify.presimplify(JSONdata[1])
  neighbourhoodTopojson = topojson.feature(neighbourhoodTopojson, neighbourhoodTopojson.objects['Dordrecht_buurten'])

  let neighbourhoodTopojson_features = neighbourhoodTopojson.features.map(neighbourhood => {

    // Dordrecht pilot
    neighbourhood.properties['GM_CODE'] = 'GM0505'
    neighbourhood.properties['GM_NAAM'] = 'Dordrecht'

    neighbourhood.properties['Aantal_bomen'] = neighbourhood.properties['buurtniveau_openbaar_aantal_bomen'] + neighbourhood.properties['buurtniveau_privaat_aantal_bomen']
    
    neighbourhood.properties['buurtniveau_openbaar_perc_boomkroon'] = (neighbourhood.properties['buurtniveau_openbaar_m2_boomkroon'] / +neighbourhood.properties['Shape_Area']) * 100
    neighbourhood.properties['buurtniveau_privaat_perc_boomkroon'] = (neighbourhood.properties['buurtniveau_privaat_m2_boomkroon'] / +neighbourhood.properties['Shape_Area']) * 100
    neighbourhood.properties['buurtniveau_openbaar_perc_grijs'] = ((neighbourhood.properties['buurtniveau_openbaar_m2_oppervlakte'] - neighbourhood.properties['buurtniveau_openbaar_m2_boomkroon']) / +neighbourhood.properties['Shape_Area']) * 100
    neighbourhood.properties['buurtniveau_privaat_perc_grijs'] = ((neighbourhood.properties['buurtniveau_privaat_m2_oppervlakte'] - neighbourhood.properties['buurtniveau_privaat_m2_boomkroon']) / +neighbourhood.properties['Shape_Area']) * 100

    return neighbourhood
  })

  console.log('allNeighbourhoodsJSONData', {type: 'FeatureCollection', features: neighbourhoodTopojson_features})
  allNeighbourhoodsJSONData.set({type: 'FeatureCollection', features: neighbourhoodTopojson_features})
}