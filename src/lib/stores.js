import { writable, derived, readable } from 'svelte/store';
import { defaultConfig, setupThemeSubscription } from './config';

export const municipalitySelection = writable(null);
export const neighbourhoodSelection = writable(null);
export const allMunicipalitiesJSONData = writable(null)
export const allNeighbourhoodsJSONData = writable(null)
export const nederlandAggregates = writable(null) // Pre-calculated Nederland values for fast initial load
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
export const districtTypeAbbreviation = readable('Wijktype')

export const indicatorsSelection = writable([])
export const alleIndicatoren = writable([])
export const AHNSelecties = writable({})

const indicatorStores = new Map()

export function getIndicatorStore(indicatorTitle) {
  if (!indicatorStores.has(indicatorTitle)) {
    // Get current AHNSelecties value without subscribing
    let currentAHNSelecties
    const unsubscribe = AHNSelecties.subscribe(v => currentAHNSelecties = v)
    unsubscribe() // Immediately unsubscribe to avoid loops

    // Initialize from existing data if available
    const existing = currentAHNSelecties[indicatorTitle]
    let initialSelection

    if (existing) {
      if (typeof existing === 'object') {
        initialSelection = {
          baseYear: existing.baseYear || '',
          compareYear: existing.compareYear || null,
          isDifference: existing.isDifference || false,
          beb: existing.beb || 'hele_buurt'
        }
      } else {
        // Legacy string format
        initialSelection = {
          baseYear: existing,
          compareYear: null,
          isDifference: false,
          beb: 'hele_buurt'
        }
      }
    } else {
      // Default values if no existing data
      initialSelection = {
        baseYear: '',
        compareYear: null,
        isDifference: false,
        beb: 'hele_buurt'
      }
    }

    const store = writable(initialSelection)
    indicatorStores.set(indicatorTitle, store)
  }
  return indicatorStores.get(indicatorTitle)
}

// Helper to get current value without subscribing
export function getIndicatorSelection(indicatorTitle) {
  const store = getIndicatorStore(indicatorTitle)
  let value
  store.subscribe(v => value = v)()
  return value
}

// Note: No automatic sync to prevent loops. 
// Components should use the new indicator stores directly.

// Initialize indicator stores from the old AHNSelecties data
export function initializeIndicatorStores(data) {
  data.metadata.forEach(indicator => {
    const baseYear = (indicator.AHNversie)
      ? indicator.AHNversie.split(',')[indicator.AHNversie.split(',').length - 1]
      : ''

    const store = getIndicatorStore(indicator.Titel)
    store.set({
      baseYear: baseYear,
      compareYear: null,
      isDifference: false,
      beb: 'hele_buurt'
    })
  })
}

export const configStore = writable(defaultConfig)

// Set up theme subscription to apply CSS variables when configStore changes
if (typeof window !== 'undefined') {
  setupThemeSubscription(configStore);
}

export const selectedNeighbourhoodJSONData = derived(
  [allNeighbourhoodsJSONData, neighbourhoodSelection, neighbourhoodCodeAbbreviation],
  ([$allNeighbourhoodsJSONData, $neighbourhoodSelection, $neighbourhoodCodeAbbreviation]) => {
    if ($allNeighbourhoodsJSONData !== null && $neighbourhoodSelection !== null) {
      // Use find() instead of filter()[0] for better performance
      return $allNeighbourhoodsJSONData.features.find(neighbourhood => neighbourhood.properties[$neighbourhoodCodeAbbreviation] === $neighbourhoodSelection) || null
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
      const count = $neighbourhoodsInMunicipalityJSONData.features.length
      // Smaller circles for larger datasets to reduce collision complexity
      if (count > 150) return 2.5
      if (count > 100) return 3.0
      if (count > 70) return 4.0  // Large datasets (70-100) - Steenwijkerland
      if (count > 40) return 4.3   // Medium datasets (40-70)
      return 4.5                   // Small datasets (<40)
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