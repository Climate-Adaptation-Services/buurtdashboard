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
  buurtTopojson1 = topojson.feature(buurtTopojson1, buurtTopojson1.objects['BuurtenDataset20240513_xaaaa'])

  let buurtTopojson2 = topojsonsimplify.presimplify(datajson[2])
  buurtTopojson2 = topojson.feature(buurtTopojson2, buurtTopojson2.objects['BuurtenDataset20240513_xaaab'])
  
  let buurtTopojson3 = topojsonsimplify.presimplify(datajson[3])
  buurtTopojson3 = topojson.feature(buurtTopojson3, buurtTopojson3.objects['BuurtenDataset20240513_xaaac'])
  
  let combinedBuurt = [...buurtTopojson1.features, ...buurtTopojson2.features, ...buurtTopojson3.features]

  combinedBuurt = combinedBuurt.map(buurt => {

    // Geboorte totaal naar percentage
    buurt.properties['Geboorte'] = (isNaN(parseFloat(buurt.properties['Geboorte'])))
      ? null
      : (buurt.properties['AANT_INW'] > 0)
        ? (parseFloat(buurt.properties['Geboorte']) / buurt.properties['AANT_INW']) * 100
        : null

    buurt.properties['m2GroenPI'] = (isNaN(parseFloat(buurt.properties['m2GroenPI']))) ? null : parseFloat(buurt.properties['m2GroenPI'])
    
    // verschillende variabelen van string naar num
    buurt.properties['F1865ErnsOv'] = (isNaN(parseFloat(buurt.properties['F18Overgewi']))) ? null : parseFloat(buurt.properties['F1865ErnsOv'])
    buurt.properties['F18ErnstigZ'] = (isNaN(parseFloat(buurt.properties['F18ErnstigZ']))) ? null : parseFloat(buurt.properties['F18ErnstigZ'])
    buurt.properties['BrozeGezon'] = (isNaN(parseFloat(buurt.properties['BrozeGezon']))) ? null : parseFloat(buurt.properties['BrozeGezon'])
    buurt.properties['G_WOZ'] = (isNaN(parseFloat(buurt.properties['G_WOZ']))) ? null : parseFloat(buurt.properties['G_WOZ'])
    buurt.properties['HuurwTperc'] = (isNaN(parseFloat(buurt.properties['HuurwTperc']))) ? null : parseFloat(buurt.properties['HuurwTperc'])
    buurt.properties['Geboorte'] = (isNaN(parseFloat(buurt.properties['Geboorte']))) ? null : parseFloat(buurt.properties['Geboorte'])

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

    const totaalOppBuurtInclAgrarisch = buurt.properties['buurt_opp_incl_agrarisch']
    buurt.properties['openbaar_opp'] = (buurt.properties['openbaar_oppervlakte'] + buurt.properties['boom_openbaar_oppervlakte']) / totaalOppBuurtInclAgrarisch * 100
    buurt.properties['nietopenbaar_opp'] = (buurt.properties['niet_openbaar_oppervlakte'] + buurt.properties['boom_niet_openbaar_oppervlakte']) / totaalOppBuurtInclAgrarisch * 100
    buurt.properties['bebouwing_opp'] = (buurt.properties['bebouwing_oppervlakte'] + buurt.properties['boom_bebouwing_oppervlakte']) / totaalOppBuurtInclAgrarisch * 100
    buurt.properties['water_opp'] = (buurt.properties['water_oppervlakte'] + buurt.properties['boom_water_oppervlakte']) / totaalOppBuurtInclAgrarisch * 100
    buurt.properties['agrarisch_opp'] = (buurt.properties['agrarisch_oppervlakte'] + buurt.properties['boom_agrarisch_oppervlakte']) / totaalOppBuurtInclAgrarisch * 100
    buurt.properties['transitie_opp'] = (buurt.properties['transitie_oppervlakte'] + buurt.properties['boom_transitie_oppervlakte']) / totaalOppBuurtInclAgrarisch * 100
    buurt.properties['overig_opp'] = (buurt.properties['overig_oppervlakte'] + buurt.properties['boom_overig_oppervlakte']) / totaalOppBuurtInclAgrarisch * 100

    const totaalOppOpenbaar = buurt.properties['boom_openbaar_oppervlakte'] + buurt.properties['openbaar_m2_groen'] + buurt.properties['openbaar_m2_nietgroen']
    buurt.properties['boom_perc_openbaar'] = buurt.properties['boom_openbaar_oppervlakte'] / totaalOppOpenbaar * 100
    buurt.properties['openbaar_perc_groen'] = buurt.properties['openbaar_m2_groen'] / totaalOppOpenbaar * 100
    buurt.properties['openbaar_perc_nietgroen']  = buurt.properties['openbaar_m2_nietgroen'] / totaalOppOpenbaar * 100

    const totaalOppNietOpenbaar = buurt.properties['boom_niet_openbaar_oppervlakte'] + buurt.properties['niet_openbaar_m2_groen'] + buurt.properties['niet_openbaar_m2_nietgroen']
    buurt.properties['boom_perc_niet_openbaar'] = buurt.properties['boom_niet_openbaar_oppervlakte'] / totaalOppNietOpenbaar * 100
    buurt.properties['niet_openbaar_perc_groen'] = buurt.properties['niet_openbaar_m2_groen'] / totaalOppNietOpenbaar * 100
    buurt.properties['niet_openbaar_perc_nietgroen'] = buurt.properties['niet_openbaar_m2_nietgroen'] / totaalOppNietOpenbaar * 100

    // Groen/Grijs/Blauw
    const totaalOppGroenGrijsBlauw = buurt.properties['m2LaagGroen_excl_agrarisch'] + buurt.properties['m2Boom_excl_agrarisch'] + buurt.properties['m2Grijs_excl_agrarisch'] + buurt.properties['m2Water']
    buurt.properties['perc_laaggroen'] = buurt.properties['m2LaagGroen_excl_agrarisch'] / totaalOppGroenGrijsBlauw * 100
    buurt.properties['perc_boom'] = buurt.properties['m2Boom_excl_agrarisch'] / totaalOppGroenGrijsBlauw * 100
    buurt.properties['perc_nietgroen'] = buurt.properties['m2Grijs_excl_agrarisch'] / totaalOppGroenGrijsBlauw * 100
    buurt.properties['perc_water'] = buurt.properties['m2Water'] / totaalOppGroenGrijsBlauw * 100

    return buurt
  })



  console.log({type: 'FeatureCollection', features: combinedBuurt})
  buurtData.set({type: 'FeatureCollection', features: combinedBuurt})
}