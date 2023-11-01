import { writable, derived } from 'svelte/store';

export const gemeenteSelection = writable(null);
export const buurtSelection = writable(null);
export const gemeenteData = writable(null)
export const buurtData = writable(null)
export const hoveredRegion = writable(null)
export const hoveredValue = writable(null)

// derive the current level of view in text. Mostly for understanding whats happening
export const currentView = derived(
  [gemeenteSelection, buurtSelection],
  ([$gemeenteSelection, $buurtSelection]) => {
    return ($gemeenteSelection === null)
      ? 'Nederland'
      : $buurtSelection === null
        ? 'Gemeente'
        : 'Buurt'
  }
)

// filter the current data for the map, based on the currentView
export const currentData = derived(
  [currentView, gemeenteData, buurtData, gemeenteSelection, buurtSelection],
  ([$currentView, $gemeenteData, $buurtData, $gemeenteSelection, $buurtSelection]) => {
    if($currentView === 'Nederland'){
      return $gemeenteData
    }else if($currentView === 'Gemeente'){
      const newFeatures = $buurtData.features.filter(buurt => buurt.properties['GM_CODE'] === $gemeenteSelection)
      return {type: 'FeatureCollection', features: newFeatures}
    }else{
      const newFeatures = $buurtData.features.filter(buurt => buurt.properties['BU_CODE'] === $buurtSelection)
      return {type: 'FeatureCollection', features: newFeatures}
    }
  }
)

export const buurtenInGemeente = derived(
  [gemeenteSelection, buurtData],
  ([$gemeenteSelection, $buurtData]) => {
    if($gemeenteSelection !== null){
      const newFeatures = $buurtData.features.filter(buurt => buurt.properties['GM_CODE'] === $gemeenteSelection)
      return {type: 'FeatureCollection', features: newFeatures}
    }else{
      return null
    }
  }
)
