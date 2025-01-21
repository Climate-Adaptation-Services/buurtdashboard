import { allMunicipalitiesJSONData, allNeighbourhoodsJSONData, neighbourhoodCodeAbbreviation } from "$lib/stores"
import * as topojsonsimplify from "topojson-simplify";
import * as topojson from "topojson-client";

export function prepareJSONData(JSONdata, dordrechtData){
  console.log('JSONdata', JSONdata)

  let municipalityTopojson = topojsonsimplify.presimplify(JSONdata[0])
  municipalityTopojson = topojson.feature(municipalityTopojson, municipalityTopojson.objects.GemeenteGrenzen2023)
  allMunicipalitiesJSONData.set(municipalityTopojson)

  let neighbourhoodTopojson = topojsonsimplify.presimplify(JSONdata[1])
  neighbourhoodTopojson = topojson.feature(neighbourhoodTopojson, neighbourhoodTopojson.objects['Dordrecht_buurten'])

  let neighbourhoodTopojson_features = neighbourhoodTopojson.features.map(neighbourhood => {
    neighbourhood.properties = dordrechtData.filter(nbh => nbh['BU_CODE'] === neighbourhood.properties['BU_CODE'])[0]

    // Dordrecht pilot
    neighbourhood.properties['GM_CODE'] = 'GM0505'
    neighbourhood.properties['GM_NAAM'] = 'Dordrecht'
 
    neighbourhood.properties['Aantal_bomen'] = neighbourhood.properties['buurtniveau_openbaar_aantal_bomen'] + neighbourhood.properties['buurtniveau_privaat_aantal_bomen']
    
    neighbourhood.properties['buurtniveau_openbaar_perc_boomkroon'] = (neighbourhood.properties['buurtniveau_openbaar_m2_boomkroon'] / +neighbourhood.properties['Shape_Area']) * 100
    neighbourhood.properties['buurtniveau_privaat_perc_boomkroon'] = (neighbourhood.properties['buurtniveau_privaat_m2_boomkroon'] / +neighbourhood.properties['Shape_Area']) * 100
    neighbourhood.properties['buurtniveau_openbaar_perc_grijs'] = ((neighbourhood.properties['buurtniveau_openbaar_m2_oppervlakte'] - neighbourhood.properties['buurtniveau_openbaar_m2_boomkroon']) / +neighbourhood.properties['Shape_Area']) * 100
    neighbourhood.properties['buurtniveau_privaat_perc_grijs'] = ((neighbourhood.properties['buurtniveau_privaat_m2_oppervlakte'] - neighbourhood.properties['buurtniveau_privaat_m2_boomkroon']) / +neighbourhood.properties['Shape_Area']) * 100

    neighbourhood.properties['BoomkrDifference'] = neighbourhood.properties['Boomkr2023'] - neighbourhood.properties['Boomkr2019']
    neighbourhood.properties['MEAN_perc_kroonbedekking_100m_Difference'] = neighbourhood.properties['MEAN_perc_kroonbedekking_100m_2023'] - neighbourhood.properties['MEAN_perc_kroonbedekking_100m_2019']

    // if(neighbourhood.properties['BU_NAAM'] === 'Oostkil'){
    //   neighbourhood.properties['BoomkrDifference'] -= 5
    // }

    return neighbourhood
  })

  console.log('allNeighbourhoodsJSONData', {type: 'FeatureCollection', features: neighbourhoodTopojson_features})
  allNeighbourhoodsJSONData.set({type: 'FeatureCollection', features: neighbourhoodTopojson_features})
}