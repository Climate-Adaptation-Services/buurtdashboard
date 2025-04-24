import { writable, derived, readable } from 'svelte/store';

export const municipalitySelection = writable(null);
export const neighbourhoodSelection = writable(null);
export const allMunicipalitiesJSONData = writable(null)
export const allNeighbourhoodsJSONData = writable(null)
export const tooltipRegion = writable(null)
export const tooltipValues = writable(null)
// mousePosition is used for positioning the tooltip
export const mousePosition = writable(null)
export const modal = writable(null);
export const lang = writable('')

export const URLParams = writable(new URLSearchParams("foo=1"))

export const neighbourhoodCodeAbbreviation = readable('buurtcode2024')
export const municipalityCodeAbbreviation = readable('gemeentecode')
export const neighbourhoodNameAbbreviation = readable('buurtnaam')
export const municipalityNameAbbreviation = readable('gemeentenaam')
export const districtTypeAbbreviation = readable('def_wijkty')

export const indicatorsSelection = writable([])
export const alleIndicatoren = writable([])
export const AHNSelecties = writable({})
export const indicatorYearChanged = writable([])

export const backgroundColor = readable('#36575B')

export const selectedNeighbourhoodJSONData = derived(
  [allNeighbourhoodsJSONData, neighbourhoodSelection, neighbourhoodCodeAbbreviation],
  ([$allNeighbourhoodsJSONData, $neighbourhoodSelection, $neighbourhoodCodeAbbreviation]) => {
    if ($allNeighbourhoodsJSONData !== null) {
      return $allNeighbourhoodsJSONData.features.filter(neighbourhood => neighbourhood.properties[$neighbourhoodCodeAbbreviation] === $neighbourhoodSelection)[0]
    } else {
      return null
    }
  }
);

// derive the current level of view in text. Mostly for understanding whats happening
export const currentOverviewLevel = derived(
  [municipalitySelection, neighbourhoodSelection],
  ([$municipalitySelection, $neighbourhoodSelection]) => {
    return ($municipalitySelection === null)
      ? 'Nederland'
      : $neighbourhoodSelection === null
        ? 'Gemeente'
        : 'Buurt'
  }
)

// filter the current data for the map, based on the currentOverviewLevel
export const currentJSONData = derived(
  [currentOverviewLevel, allMunicipalitiesJSONData, allNeighbourhoodsJSONData, municipalitySelection, neighbourhoodSelection, municipalityCodeAbbreviation],
  ([$currentOverviewLevel, $allMunicipalitiesJSONData, $allNeighbourhoodsJSONData, $municipalitySelection, $neighbourhoodSelection, $municipalityCodeAbbreviation]) => {
    if ($currentOverviewLevel === 'Nederland') {
      return $allMunicipalitiesJSONData
    } else if ($currentOverviewLevel === 'Gemeente') {
      const newFeatures = $allNeighbourhoodsJSONData.features.filter(neighbourhood => neighbourhood.properties[$municipalityCodeAbbreviation] === $municipalitySelection)
      return { type: 'FeatureCollection', features: newFeatures }
    } else {
      const newFeatures = $allNeighbourhoodsJSONData.features.filter(neighbourhood => neighbourhood.properties[$municipalityCodeAbbreviation] === $municipalitySelection)
      return { type: 'FeatureCollection', features: newFeatures }
      // const newFeatures = $allNeighbourhoodsJSONData.features.filter(neighbourhood => neighbourhood.properties['bu_code'] === $neighbourhoodSelection)
      // return {type: 'FeatureCollection', features: newFeatures}
    }
  }
)

export const neighbourhoodsInMunicipalityJSONData = derived(
  [municipalitySelection, allNeighbourhoodsJSONData, municipalityCodeAbbreviation],
  ([$municipalitySelection, $allNeighbourhoodsJSONData, $municipalityCodeAbbreviation]) => {
    if ($municipalitySelection !== null && $allNeighbourhoodsJSONData) {
      const newFeatures = $allNeighbourhoodsJSONData.features.filter(neighbourhood => neighbourhood.properties[$municipalityCodeAbbreviation] === $municipalitySelection)
      return { type: 'FeatureCollection', features: newFeatures }
    } else {
      return null
    }
  }
)

export const circleRadius = derived(
  [neighbourhoodsInMunicipalityJSONData],
  ([$neighbourhoodsInMunicipalityJSONData]) => {
    if ($neighbourhoodsInMunicipalityJSONData) {
      return ($neighbourhoodsInMunicipalityJSONData.features.length > 150) ? 3 : 4.5
    } else {
      return 0
    }
  }
)

export const districtTypeJSONData = derived(
  [neighbourhoodSelection, allNeighbourhoodsJSONData, selectedNeighbourhoodJSONData, districtTypeAbbreviation],
  ([$neighbourhoodSelection, $allNeighbourhoodsJSONData, $selectedNeighbourhoodJSONData, $districtTypeAbbreviation]) => {
    if ($neighbourhoodSelection !== null) {
      return { type: 'FeatureCollection', features: $allNeighbourhoodsJSONData.features.filter(neighbourhood => neighbourhood.properties[$districtTypeAbbreviation] === $selectedNeighbourhoodJSONData.properties[$districtTypeAbbreviation]) }
    } else {
      return null
    }
  }
)

export const currentCodeAbbreviation = derived(
  [currentOverviewLevel, municipalityCodeAbbreviation, neighbourhoodCodeAbbreviation],
  ([$currentOverviewLevel, $municipalityCodeAbbreviation, $neighbourhoodCodeAbbreviation]) => {
    return ($currentOverviewLevel === 'Nederland') ? $municipalityCodeAbbreviation : $neighbourhoodCodeAbbreviation
  }
)

export const currentNameAbbreviation = derived(
  [currentOverviewLevel, municipalityNameAbbreviation, neighbourhoodNameAbbreviation],
  ([$currentOverviewLevel, $municipalityNameAbbreviation, $neighbourhoodNameAbbreviation]) => {
    return ($currentOverviewLevel === 'Nederland') ? $municipalityNameAbbreviation : $neighbourhoodNameAbbreviation
  }
)

