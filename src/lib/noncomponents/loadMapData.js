import { gemeenteData, buurtData } from "$lib/stores"
import * as topojsonsimplify from "topojson-simplify";
import * as topojson from "topojson-client";

export function loadMapData(datajson){
  console.log(datajson)
  let gemeenteTopojson = topojsonsimplify.presimplify(datajson[0])
  gemeenteTopojson = topojson.feature(gemeenteTopojson, gemeenteTopojson.objects.GemeenteDatasetTest20231011)
  gemeenteData.set(gemeenteTopojson)

  // let buurtTopojson = topojsonsimplify.presimplify(datajson[1])
  // buurtTopojson = topojson.feature(buurtTopojson, buurtTopojson.objects.BuurtenTestDataset_20231016)
  // buurtData.set(buurtTopojson)

  let buurtTopojson1 = topojsonsimplify.presimplify(datajson[2])
  buurtTopojson1 = topojson.feature(buurtTopojson1, buurtTopojson1.objects.BuurtenDataset20231106_xaaaa)

  let buurtTopojson2 = topojsonsimplify.presimplify(datajson[3])
  buurtTopojson2 = topojson.feature(buurtTopojson2, buurtTopojson2.objects.BuurtenDataset20231106_xaaab)
  
  console.log({type: 'FeatureCollection', features: [...buurtTopojson1.features, ...buurtTopojson2.features]})
  buurtData.set({type: 'FeatureCollection', features: [...buurtTopojson1.features, ...buurtTopojson2.features]})
}