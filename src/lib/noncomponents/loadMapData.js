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
  buurtTopojson1 = topojson.feature(buurtTopojson1, buurtTopojson1.objects.BuurtenDataset20240227_xaaaa)

  let buurtTopojson2 = topojsonsimplify.presimplify(datajson[2])
  buurtTopojson2 = topojson.feature(buurtTopojson2, buurtTopojson2.objects.BuurtenDataset20240227_xaaab)
  
  let buurtTopojson3 = topojsonsimplify.presimplify(datajson[3])
  buurtTopojson3 = topojson.feature(buurtTopojson3, buurtTopojson3.objects.BuurtenDataset20240227_xaaac)
  
  let combinedBuurt = [...buurtTopojson1.features, ...buurtTopojson2.features, ...buurtTopojson3.features]

  combinedBuurt = combinedBuurt.map(buurt => {

    // Geboorte totaal naar percentage
    buurt.properties['Geboorte'] = (isNaN(parseFloat(buurt.properties['Geboorte'])))
      ? null
      : (buurt.properties['AANT_INW'] > 0)
        ? (parseFloat(buurt.properties['Geboorte']) / buurt.properties['AANT_INW']) * 100
        : null
    
    // Ernstig overgewicht van string naar num
    buurt.properties['ErnsOverge'] = (isNaN(parseFloat(buurt.properties['ErnsOverge'])))
      ? null
      : parseFloat(buurt.properties['ErnsOverge'])

    // koele plekken naar percentage
    // buurt.properties['ATK_KPperc'] *= 100

    // waterdiepte naar percentage
    buurt.properties['perc5_10mm'] *= 100
    buurt.properties['perc10_15mm'] *= 100
    buurt.properties['perc15_20mm'] *= 100
    buurt.properties['perc20_30mm'] *= 100
    buurt.properties['perc30mmME'] *= 100
    buurt.properties['perc5mmMN'] = 100 - buurt.properties['perc5_10mm'] - buurt.properties['perc10_15mm'] - buurt.properties['perc15_20mm'] - buurt.properties['perc20_30mm'] - buurt.properties['perc30mmME'];

    if(buurt.properties['BEV_DICHTH'] < 0){
      buurt.properties['BEV_DICHTH'] = null
    } 

    if(!buurt.properties['PaalHuidig']){
      console.log(buurt.properties['PaalHuidig'])
    }

    return buurt
  })



  console.log({type: 'FeatureCollection', features: combinedBuurt})
  buurtData.set({type: 'FeatureCollection', features: combinedBuurt})
}