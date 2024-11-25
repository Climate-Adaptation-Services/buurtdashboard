import { alleGemeentesJSONData, alleBuurtenJSONData } from "$lib/stores"
import * as topojsonsimplify from "topojson-simplify";
import * as topojson from "topojson-client";

export function prepareJSONData(JSONdata){
  console.log('JSONdata', JSONdata)
  // let gemeenteTopojson = topojsonsimplify.presimplify(JSONdata[0])
  // gemeenteTopojson = topojson.feature(gemeenteTopojson, gemeenteTopojson.objects.GemeenteGrenzen2023)
  // alleGemeentesJSONData.set(gemeenteTopojson)

  // let buurtTopojson1 = topojsonsimplify.presimplify(JSONdata[1])
  // buurtTopojson1 = topojson.feature(buurtTopojson1, buurtTopojson1.objects['BuurtenDataset20240913_xaaaa'])

  // let buurtTopojson2 = topojsonsimplify.presimplify(JSONdata[2])
  // buurtTopojson2 = topojson.feature(buurtTopojson2, buurtTopojson2.objects['BuurtenDataset20240913_xaaab'])
  
  // let buurtTopojson3 = topojsonsimplify.presimplify(JSONdata[3])
  // buurtTopojson3 = topojson.feature(buurtTopojson3, buurtTopojson3.objects['BuurtenDataset20240913_xaaac'])
  
  // let combinedBuurt = [...buurtTopojson1.features, ...buurtTopojson2.features, ...buurtTopojson3.features]

  console.log('JSONdata', JSONdata)
  let gemeenteTopojson = topojsonsimplify.presimplify(JSONdata[0])
  gemeenteTopojson = topojson.feature(gemeenteTopojson, gemeenteTopojson.objects.GemeenteGrenzen2023)
  alleGemeentesJSONData.set(gemeenteTopojson)

  let buurtTopojson = topojsonsimplify.presimplify(JSONdata[1])
  buurtTopojson = topojson.feature(buurtTopojson, buurtTopojson.objects['Dordrecht_buurten'])

  let buurtTopojson_features = buurtTopojson.features.map(buurt => {

    // Dordrecht pilot
    buurt.properties['GM_CODE'] = 'GM0505'
    buurt.properties['GM_NAAM'] = 'Dordrecht'

    buurt.properties['Aantal_bomen'] = buurt.properties['buurtniveau_openbaar_aantal_bomen'] + buurt.properties['buurtniveau_privaat_aantal_bomen']
    
    buurt.properties['buurtniveau_openbaar_perc_boomkroon'] = (buurt.properties['buurtniveau_openbaar_m2_boomkroon'] / +buurt.properties['Shape_Area']) * 100
    buurt.properties['buurtniveau_privaat_perc_boomkroon'] = (buurt.properties['buurtniveau_privaat_m2_boomkroon'] / +buurt.properties['Shape_Area']) * 100
    buurt.properties['buurtniveau_openbaar_perc_grijs'] = ((buurt.properties['buurtniveau_openbaar_m2_oppervlakte'] - buurt.properties['buurtniveau_openbaar_m2_boomkroon']) / +buurt.properties['Shape_Area']) * 100
    buurt.properties['buurtniveau_privaat_perc_grijs'] = ((buurt.properties['buurtniveau_privaat_m2_oppervlakte'] - buurt.properties['buurtniveau_privaat_m2_boomkroon']) / +buurt.properties['Shape_Area']) * 100


    // buurt.properties['m2GroenPI'] = (isNaN(parseFloat(buurt.properties['m2GroenPI']))) ? null : parseFloat(buurt.properties['m2GroenPI'])

    // verschillende variabelen van string naar num
    // buurt.properties['F1865ErnsOv'] = (isNaN(parseFloat(buurt.properties['F1865ErnsOv']))) ? null : parseFloat(buurt.properties['F1865ErnsOv'])
    // buurt.properties['F18ErnstigZ'] = (isNaN(parseFloat(buurt.properties['F18ErnstigZ']))) ? null : parseFloat(buurt.properties['F18ErnstigZ'])
    // buurt.properties['BrozeGezon'] = (isNaN(parseFloat(buurt.properties['BrozeGezon']))) ? null : parseFloat(buurt.properties['BrozeGezon'])
    // buurt.properties['G_WOZ'] = (isNaN(parseFloat(buurt.properties['G_WOZ']))) ? null : parseFloat(buurt.properties['G_WOZ'])
    // buurt.properties['HuurwTperc'] = (isNaN(parseFloat(buurt.properties['HuurwTperc']))) ? null : parseFloat(buurt.properties['HuurwTperc'])
    // buurt.properties['perc_groen_zonder_agr'] = (isNaN(parseFloat(buurt.properties['perc_groen_zonder_agr']))) ? null : parseFloat(buurt.properties['perc_groen_zonder_agr'])

    // if(buurt.properties['BEV_DICHTH'] < 0){
    //   buurt.properties['BEV_DICHTH'] = null
    // } 

    return buurt
  })

  console.log('alleBuurtenJSONData', {type: 'FeatureCollection', features: buurtTopojson_features})
  alleBuurtenJSONData.set({type: 'FeatureCollection', features: buurtTopojson_features})
}