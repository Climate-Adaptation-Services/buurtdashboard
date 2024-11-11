import { gemeenteData, buurtData } from "$lib/stores"
import * as topojsonsimplify from "topojson-simplify";
import * as topojson from "topojson-client";

export function loadMapData(datajson){
  console.log('datajson', datajson)
  let gemeenteTopojson = topojsonsimplify.presimplify(datajson[0])
  gemeenteTopojson = topojson.feature(gemeenteTopojson, gemeenteTopojson.objects.GemeenteGrenzen2023)
  gemeenteData.set(gemeenteTopojson)

  let buurtTopojson = topojsonsimplify.presimplify(datajson[1])
  buurtTopojson = topojson.feature(buurtTopojson, buurtTopojson.objects['Dordrecht_buurten'])

  let buurtTopojson_features = buurtTopojson.features.map(buurt => {

    // Dordrecht pilot
    buurt.properties['GM_CODE'] = 'GM0505'
    buurt.properties['GM_NAAM'] = 'Dordrecht'

    buurt.properties['Aantal_bomen'] = buurt.properties['buurtniveau_openbaar_aantal_bomen'] + buurt.properties['buurtniveau_privaat_aantal_bomen']

    const totalOpp = buurt.properties['buurtniveau_privaat_m2_oppervlakte'] + buurt.properties['buurtniveau_openbaar_m2_oppervlakte']
    buurt.properties['buurt_opp_zonderagr'] = totalOpp

    buurt.properties['buurtniveau_openbaar_perc_boomkroon'] = (buurt.properties['buurtniveau_openbaar_m2_boomkroon'] / totalOpp) * 100
    buurt.properties['buurtniveau_privaat_perc_boomkroon'] = (buurt.properties['buurtniveau_privaat_m2_boomkroon'] / totalOpp) * 100
    buurt.properties['buurtniveau_openbaar_perc_grijs'] = ((buurt.properties['buurtniveau_openbaar_m2_oppervlakte'] - buurt.properties['buurtniveau_openbaar_m2_boomkroon']) / totalOpp) * 100
    buurt.properties['buurtniveau_privaat_perc_grijs'] = ((buurt.properties['buurtniveau_privaat_m2_oppervlakte'] - buurt.properties['buurtniveau_privaat_m2_boomkroon']) / totalOpp) * 100

    // buurtniveau_privaat_m2_oppervlakte,buurtniveau_openbaar_m2_oppervlakte
    // buurtniveau_privaat_m2_boomkroon,buurtniveau_openbaar_m2_boomkroon

    // buurt.properties['m2GroenPI'] = (isNaN(parseFloat(buurt.properties['m2GroenPI']))) ? null : parseFloat(buurt.properties['m2GroenPI'])

    // // verschillende variabelen van string naar num
    // buurt.properties['F1865ErnsOv'] = (isNaN(parseFloat(buurt.properties['F1865ErnsOv']))) ? null : parseFloat(buurt.properties['F1865ErnsOv'])
    // buurt.properties['F18ErnstigZ'] = (isNaN(parseFloat(buurt.properties['F18ErnstigZ']))) ? null : parseFloat(buurt.properties['F18ErnstigZ'])
    // buurt.properties['BrozeGezon'] = (isNaN(parseFloat(buurt.properties['BrozeGezon']))) ? null : parseFloat(buurt.properties['BrozeGezon'])
    // buurt.properties['G_WOZ'] = (isNaN(parseFloat(buurt.properties['G_WOZ']))) ? null : parseFloat(buurt.properties['G_WOZ'])
    // buurt.properties['HuurwTperc'] = (isNaN(parseFloat(buurt.properties['HuurwTperc']))) ? null : parseFloat(buurt.properties['HuurwTperc'])
    // // buurt.properties['Geboorte'] = (isNaN(parseFloat(buurt.properties['Geboorte']))) ? null : parseFloat(buurt.properties['Geboorte'])
    // buurt.properties['perc_groen_zonder_agr'] = (isNaN(parseFloat(buurt.properties['perc_groen_zonder_agr']))) ? null : parseFloat(buurt.properties['perc_groen_zonder_agr'])

    // if(buurt.properties['BEV_DICHTH'] < 0){
    //   buurt.properties['BEV_DICHTH'] = null
    // } 

    return buurt
  })

  console.log('buurtData', {type: 'FeatureCollection', features: buurtTopojson_features})
  buurtData.set({type: 'FeatureCollection', features: buurtTopojson_features})
}