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
  buurtTopojson1 = topojson.feature(buurtTopojson1, buurtTopojson1.objects['BuurtenDataset20240506_xaaaa'])

  let buurtTopojson2 = topojsonsimplify.presimplify(datajson[2])
  buurtTopojson2 = topojson.feature(buurtTopojson2, buurtTopojson2.objects['BuurtenDataset20240506_xaaab'])
  
  let buurtTopojson3 = topojsonsimplify.presimplify(datajson[3])
  buurtTopojson3 = topojson.feature(buurtTopojson3, buurtTopojson3.objects['BuurtenDataset20240506_xaaac'])
  
  let combinedBuurt = [...buurtTopojson1.features, ...buurtTopojson2.features, ...buurtTopojson3.features]

  combinedBuurt = combinedBuurt.map(buurt => {

    // Geboorte totaal naar percentage
    buurt.properties['Geboorte'] = (isNaN(parseFloat(buurt.properties['Geboorte'])))
      ? null
      : (buurt.properties['AANT_INW'] > 0)
        ? (parseFloat(buurt.properties['Geboorte']) / buurt.properties['AANT_INW']) * 100
        : null
    
    // Ernstig overgewicht van string naar num
    buurt.properties['F18Overgewi'] = (isNaN(parseFloat(buurt.properties['F18Overgewi'])))
      ? null
      : parseFloat(buurt.properties['F18Overgewi'])

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

    buurt.properties['perc_groen_zonder_agr'] = buurt.properties['m2Groen_excl_agrarisch'] / buurt.properties['buurt_opp_zonderagr'] * 100


    const totaalOppFunctioneleGebieden = buurt.properties['openbaar_oppervlakte'] + buurt.properties['boom_openbaar_oppervlakte'] + buurt.properties['niet_openbaar_oppervlakte'] + buurt.properties['boom_niet_openbaar_oppervlakte'] + buurt.properties['bebouwing_oppervlakte'] + buurt.properties['boom_bebouwing_oppervlakte'] + buurt.properties['water_oppervlakte'] + buurt.properties['boom_water_oppervlakte'] + buurt.properties['agrarisch_oppervlakte'] + buurt.properties['boom_agrarisch_oppervlakte'] + buurt.properties['transitie_oppervlakte'] + buurt.properties['boom_transitie_oppervlakte'] + buurt.properties['overig_oppervlakte'] + buurt.properties['boom_overig_oppervlakte']
    buurt.properties['openbaar_opp'] = (buurt.properties['openbaar_oppervlakte'] + buurt.properties['boom_openbaar_oppervlakte']) / totaalOppFunctioneleGebieden * 100
    buurt.properties['nietopenbaar_opp'] = (buurt.properties['niet_openbaar_oppervlakte'] + buurt.properties['boom_niet_openbaar_oppervlakte']) / totaalOppFunctioneleGebieden * 100
    buurt.properties['bebouwing_opp'] = (buurt.properties['bebouwing_oppervlakte'] + buurt.properties['boom_bebouwing_oppervlakte']) / totaalOppFunctioneleGebieden * 100
    buurt.properties['water_opp'] = (buurt.properties['water_oppervlakte'] + buurt.properties['boom_water_oppervlakte']) / totaalOppFunctioneleGebieden * 100
    buurt.properties['agrarisch_opp'] = (buurt.properties['agrarisch_oppervlakte'] + buurt.properties['boom_agrarisch_oppervlakte']) / totaalOppFunctioneleGebieden * 100
    buurt.properties['transitie_opp'] = (buurt.properties['transitie_oppervlakte'] + buurt.properties['boom_transitie_oppervlakte']) / totaalOppFunctioneleGebieden * 100
    buurt.properties['overig_opp'] = (buurt.properties['overig_oppervlakte'] + buurt.properties['boom_overig_oppervlakte']) / totaalOppFunctioneleGebieden * 100

    // buurt.properties['allBomen'] *= buurt.properties['buurt_opp_zonderagr']/buurt.properties['Shape_Area']
    // buurt.properties['allGroenLa'] *= buurt.properties['buurt_opp_zonderagr']/buurt.properties['Shape_Area']
    // buurt.properties['allGrijs'] *= buurt.properties['buurt_opp_zonderagr']/buurt.properties['Shape_Area']
    // buurt.properties['water2'] *= buurt.properties['buurt_opp_zonderagr']/buurt.properties['Shape_Area']

    // if(buurt.properties['m2GroenPI'] > 50){
    //   buurt.properties['m2GroenPI'] = 50
    // }

    return buurt
  })



  console.log({type: 'FeatureCollection', features: combinedBuurt})
  buurtData.set({type: 'FeatureCollection', features: combinedBuurt})
}