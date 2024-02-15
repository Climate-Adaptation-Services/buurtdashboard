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
  buurtTopojson1 = topojson.feature(buurtTopojson1, buurtTopojson1.objects.BuurtenDataset20231212_xaaaa)

  let buurtTopojson2 = topojsonsimplify.presimplify(datajson[2])
  buurtTopojson2 = topojson.feature(buurtTopojson2, buurtTopojson2.objects.BuurtenDataset20231212_xaaab)
  
  let buurtTopojson3 = topojsonsimplify.presimplify(datajson[3])
  buurtTopojson3 = topojson.feature(buurtTopojson3, buurtTopojson3.objects.BuurtenDataset20231212_xaaac)
  
  let combinedBuurt = [...buurtTopojson1.features, ...buurtTopojson2.features, ...buurtTopojson3.features]

  // Geboorte totaal naar percentage
  combinedBuurt = combinedBuurt.map(buurt => {
    buurt.properties['Geboorte'] = (isNaN(parseFloat(buurt.properties['Geboorte'])))
      ? null
      : (buurt.properties['AANT_INW'] > 0)
        ? (parseFloat(buurt.properties['Geboorte']) / buurt.properties['AANT_INW']) * 100
        : null
    return buurt
  })

  // Ernstig overgewicht van string naar num
  combinedBuurt = combinedBuurt.map(buurt => {
    buurt.properties['ErnsOverge'] = (isNaN(parseFloat(buurt.properties['ErnsOverge'])))
      ? null
      : parseFloat(buurt.properties['ErnsOverge'])
    return buurt
  })

  // koele plekken naar percentage
  combinedBuurt = combinedBuurt.map(buurt => {
    buurt.properties['ATK_KPperc'] *= 100
    return buurt
  })

  console.log({type: 'FeatureCollection', features: combinedBuurt})
  buurtData.set({type: 'FeatureCollection', features: combinedBuurt})
}