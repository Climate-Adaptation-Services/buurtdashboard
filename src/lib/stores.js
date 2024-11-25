import { writable, derived, readable } from 'svelte/store';

export const gemeenteSelection = writable(null);
export const buurtSelection = writable(null);
export const alleGemeentesJSONData = writable(null)
export const alleBuurtenJSONData = writable(null)
export const tooltipRegion = writable(null)
export const tooltipValues = writable(null)
// mousePosition is used for positioning the tooltip
export const mousePosition = writable(null)
export const modal = writable(null);
export const lang = writable('')

export const URLParams = writable(new URLSearchParams("foo=1"))

export const buurtCodeAfkorting = readable('BU_CODE')
export const gemeenteCodeAfkorting = readable('GM_CODE')
export const buurtNaamAfkorting = readable('BU_NAAM')
export const gemeenteNaamAfkorting = readable('GM_NAAM')
export const wijktypeAfkorting = readable('def_wijkty')

export const indicatorenSelectie = writable([])
export const alleIndicatoren2019 = writable([])

export const geselecteerdeBuurtJSONData = derived(
  [alleBuurtenJSONData, buurtSelection],
  ([$alleBuurtenJSONData, $buurtSelection]) => {
    if($alleBuurtenJSONData !== null){
      return $alleBuurtenJSONData.features.filter(buurt => buurt.properties['BU_CODE'] === $buurtSelection)[0]
    }else{
      return null
    }
  }
);

// derive the current level of view in text. Mostly for understanding whats happening
export const huidigOverzichtsniveau = derived(
  [gemeenteSelection, buurtSelection],
  ([$gemeenteSelection, $buurtSelection]) => {
    return ($gemeenteSelection === null)
      ? 'Nederland'
      : $buurtSelection === null
        ? 'Gemeente'
        : 'Buurt'
  }
)

// filter the current data for the map, based on the huidigOverzichtsniveau
export const huidigeJSONData = derived(
  [huidigOverzichtsniveau, alleGemeentesJSONData, alleBuurtenJSONData, gemeenteSelection, buurtSelection],
  ([$huidigOverzichtsniveau, $alleGemeentesJSONData, $alleBuurtenJSONData, $gemeenteSelection, $buurtSelection]) => {
    if($huidigOverzichtsniveau === 'Nederland'){
      return $alleGemeentesJSONData
    }else if($huidigOverzichtsniveau === 'Gemeente'){
      const newFeatures = $alleBuurtenJSONData.features.filter(buurt => buurt.properties['GM_CODE'] === $gemeenteSelection)
      return {type: 'FeatureCollection', features: newFeatures}
    }else{
      const newFeatures = $alleBuurtenJSONData.features.filter(buurt => buurt.properties['GM_CODE'] === $gemeenteSelection)
      return {type: 'FeatureCollection', features: newFeatures}
      // const newFeatures = $alleBuurtenJSONData.features.filter(buurt => buurt.properties['bu_code'] === $buurtSelection)
      // return {type: 'FeatureCollection', features: newFeatures}
    }
  }
)

export const buurtenInGemeenteJSONData = derived(
  [gemeenteSelection, alleBuurtenJSONData],
  ([$gemeenteSelection, $alleBuurtenJSONData]) => {
    if($gemeenteSelection !== null && $alleBuurtenJSONData){
      const newFeatures = $alleBuurtenJSONData.features.filter(buurt => buurt.properties['GM_CODE'] === $gemeenteSelection)
      return {type: 'FeatureCollection', features: newFeatures}
    }else{
      return null
    }
  }
)

export const circleRadius = derived(
  [buurtenInGemeenteJSONData],
  ([$buurtenInGemeenteJSONData]) => {
    if($buurtenInGemeenteJSONData){
      return ($buurtenInGemeenteJSONData.features.length > 150) ? 3 : 5
    }else{
      return 0
    }
  }
)

export const wijkTypeJSONData = derived(
  [buurtSelection, alleBuurtenJSONData, geselecteerdeBuurtJSONData, wijktypeAfkorting],
  ([$buurtSelection, $alleBuurtenJSONData, $geselecteerdeBuurtJSONData, $wijktypeAfkorting]) => {
    if($buurtSelection !== null){
      return {type: 'FeatureCollection', features: $alleBuurtenJSONData.features.filter(buurt => buurt.properties[$wijktypeAfkorting] === $geselecteerdeBuurtJSONData.properties[$wijktypeAfkorting])}
    }else{
      return null
    }
  }
)

export const huidigeCodeAfkorting = derived(
  [huidigOverzichtsniveau, gemeenteCodeAfkorting, buurtCodeAfkorting],
  ([$huidigOverzichtsniveau, $gemeenteCodeAfkorting, $buurtCodeAfkorting]) => {
    return ($huidigOverzichtsniveau === 'Nederland') ? $gemeenteCodeAfkorting : $buurtCodeAfkorting
  }
)

export const huidigeNaamAfkorting = derived(
  [huidigOverzichtsniveau, gemeenteNaamAfkorting, buurtNaamAfkorting],
  ([$huidigOverzichtsniveau, $gemeenteNaamAfkorting, $buurtNaamAfkorting]) => {
    return ($huidigOverzichtsniveau === 'Nederland') ? $gemeenteNaamAfkorting : $buurtNaamAfkorting
  }
)

