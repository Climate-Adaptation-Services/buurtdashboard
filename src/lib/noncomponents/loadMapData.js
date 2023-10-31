import { gemeenteData, buurtData } from "$lib/stores"
import * as topojsonsimplify from "topojson-simplify";
import * as topojson from "topojson-client";

export function loadMapData(datajson){
  let gemeenteTopojson = topojsonsimplify.presimplify(datajson[0])
  gemeenteTopojson = topojson.feature(gemeenteTopojson, gemeenteTopojson.objects.GemeenteDatasetTest20231011)
  gemeenteData.set(gemeenteTopojson)

  let buurtTopojson = topojsonsimplify.presimplify(datajson[1])
  buurtTopojson = topojson.feature(buurtTopojson, buurtTopojson.objects.BuurtenTestDataset_20231016)
  buurtData.set(buurtTopojson)
}