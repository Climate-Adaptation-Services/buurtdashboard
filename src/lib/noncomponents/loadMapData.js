import { gemeenteData, buurtData } from "$lib/stores"
import * as topojsonsimplify from "topojson-simplify";
import * as topojson from "topojson-client";

export function loadMapData(datajson){
  console.log(datajson)
  let gemeenteTopojson = topojsonsimplify.presimplify(datajson[0])
  gemeenteTopojson = topojson.feature(gemeenteTopojson, gemeenteTopojson.objects.GemeenteGrenzen2023)
  gemeenteData.set(gemeenteTopojson)
  console.log(gemeenteTopojson)

  // let buurtTopojson = topojsonsimplify.presimplify(datajson[1])
  // buurtTopojson = topojson.feature(buurtTopojson, buurtTopojson.objects.BuurtenTestDataset_20231016)
  // buurtData.set(buurtTopojson)


  let buurtTopojson1 = topojsonsimplify.presimplify(datajson[1])
  buurtTopojson1 = topojson.feature(buurtTopojson1, buurtTopojson1.objects['BuurtenDataset20240806_xaaaa'])

  let buurtTopojson2 = topojsonsimplify.presimplify(datajson[2])
  buurtTopojson2 = topojson.feature(buurtTopojson2, buurtTopojson2.objects['BuurtenDataset20240806_xaaab'])
  
  let buurtTopojson3 = topojsonsimplify.presimplify(datajson[3])
  buurtTopojson3 = topojson.feature(buurtTopojson3, buurtTopojson3.objects['BuurtenDataset20240806_xaaac'])
  
  let combinedBuurt = [...buurtTopojson1.features, ...buurtTopojson2.features, ...buurtTopojson3.features]

  combinedBuurt = combinedBuurt.map(buurt => {

    buurt.properties['m2GroenPI'] = (isNaN(parseFloat(buurt.properties['m2GroenPI']))) ? null : parseFloat(buurt.properties['m2GroenPI'])

    // verschillende variabelen van string naar num
    buurt.properties['F1865ErnsOv'] = (isNaN(parseFloat(buurt.properties['F1865ErnsOv']))) ? null : parseFloat(buurt.properties['F1865ErnsOv'])
    buurt.properties['F18ErnstigZ'] = (isNaN(parseFloat(buurt.properties['F18ErnstigZ']))) ? null : parseFloat(buurt.properties['F18ErnstigZ'])
    buurt.properties['BrozeGezon'] = (isNaN(parseFloat(buurt.properties['BrozeGezon']))) ? null : parseFloat(buurt.properties['BrozeGezon'])
    buurt.properties['G_WOZ'] = (isNaN(parseFloat(buurt.properties['G_WOZ']))) ? null : parseFloat(buurt.properties['G_WOZ'])
    buurt.properties['HuurwTperc'] = (isNaN(parseFloat(buurt.properties['HuurwTperc']))) ? null : parseFloat(buurt.properties['HuurwTperc'])
    // buurt.properties['Geboorte'] = (isNaN(parseFloat(buurt.properties['Geboorte']))) ? null : parseFloat(buurt.properties['Geboorte'])
    buurt.properties['perc_groen_zonder_agr'] = (isNaN(parseFloat(buurt.properties['perc_groen_zonder_agr']))) ? null : parseFloat(buurt.properties['perc_groen_zonder_agr'])

    if(buurt.properties['BEV_DICHTH'] < 0){
      buurt.properties['BEV_DICHTH'] = null
    } 

    return buurt
  })

  console.log({type: 'FeatureCollection', features: combinedBuurt})
  buurtData.set({type: 'FeatureCollection', features: combinedBuurt})
}