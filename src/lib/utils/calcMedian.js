import { getIndicatorStore } from '$lib/stores'

export const calcMedian = (array) => {
  // Handle empty array
  if (!array || array.length === 0) {
    return "Geen data"
  }

  // FIXED: Filter for valid numbers (including negatives) and convert to numbers
  const OnlyNumbers = array
    .filter(d => d !== null && d !== undefined && !isNaN(+d) && isFinite(+d))
    .map(d => +d)

  // Handle case where no valid numbers remain after filtering
  if (OnlyNumbers.length === 0) {
    return "Geen data"
  }

  // Sort numbers (ascending order for proper median calculation)
  OnlyNumbers.sort((a, b) => a - b)
  const length = OnlyNumbers.length

  if (length % 2 === 0) {
    return (OnlyNumbers[length / 2] + OnlyNumbers[(length / 2) - 1]) / 2
  } else {
    return OnlyNumbers[Math.floor(length / 2)]
  }
}

/**
 * Calculate average (mean) of an array of values
 * @param {Array} array - Array of values
 * @returns {number|string} Average or "Geen data" if no valid data
 */
export const calcAverage = (array) => {
  // Handle empty array
  if (!array || array.length === 0) {
    return "Geen data"
  }

  // Filter for valid numbers and convert to numbers
  const OnlyNumbers = array
    .filter(d => d !== null && d !== undefined && !isNaN(+d) && isFinite(+d))
    .map(d => +d)

  // Handle case where no valid numbers remain after filtering
  if (OnlyNumbers.length === 0) {
    return "Geen data"
  }

  // Calculate average
  const sum = OnlyNumbers.reduce((acc, val) => acc + val, 0)
  return sum / OnlyNumbers.length
}

/**
 * Calculate weighted average based on surface area
 * @param {Array} features - Array of GeoJSON features
 * @param {Function} valueExtractor - Function to extract value from feature
 * @param {string} surfaceAreaColumn - Column name for surface area
 * @param {Object} indicator - Indicator object (optional, for BEB variant detection)
 * @returns {number|string} Weighted average or "Geen data" if no valid data
 */
export const calcWeightedAverage = (features, valueExtractor, surfaceAreaColumn, indicator = null) => {
  if (!features || features.length === 0) {
    return "Geen data"
  }

  // Special handling for "Totale buurt" - map to standard column
  if (surfaceAreaColumn === 'Totale buurt') {
    surfaceAreaColumn = 'Oppervlakte_Land_m2'
  }

  // Check if we need to apply BEB suffix to surface area column
  let actualSurfaceAreaColumn = surfaceAreaColumn
  let shouldTryFallback = false

  const variants = indicator && indicator.variants ? indicator.variants.split(',').map(v => v.trim()) : []
  const bebVariant = variants.find(v => v !== 'M2' && v !== '') // Find the BEB variant (not M2)

  if (bebVariant) {
    const indicatorStore = getIndicatorStore(indicator.title)
    let ahnSelection

    const unsubscribe = indicatorStore.subscribe(value => {
      ahnSelection = value
    })
    unsubscribe()

    const bebSelection = ahnSelection?.beb || 'hele_buurt'
    if (bebSelection === 'bebouwde_kom') {
      actualSurfaceAreaColumn = surfaceAreaColumn + '_' + bebVariant
      shouldTryFallback = true
    }
  }

  let totalWeightedSum = 0
  let totalSurfaceArea = 0
  let validCount = 0
  let invalidCount = 0

  features.forEach(feature => {
    const value = valueExtractor(feature)
    let surfaceArea = feature.properties?.[actualSurfaceAreaColumn]

    // If surface area column doesn't exist or is 0, default to 1 (equal weight)
    if (surfaceArea === null || surfaceArea === undefined || isNaN(+surfaceArea) || +surfaceArea === 0) {
      surfaceArea = 1
    }

    if (value !== null && value !== undefined && !isNaN(+value)) {
      const numValue = +value
      const numSurfaceArea = +surfaceArea

      // Use raw percentage values directly - no conversion needed
      // The weighted average formula naturally accounts for surface area differences
      totalWeightedSum += numValue * numSurfaceArea
      totalSurfaceArea += numSurfaceArea
      validCount++
    } else {
      invalidCount++
    }
  })

  // If BEB variant was selected but no data found, fall back to base column
  if (shouldTryFallback && validCount === 0 && totalSurfaceArea === 0) {
    // Reset counters and try again with base column
    totalWeightedSum = 0
    totalSurfaceArea = 0
    validCount = 0
    invalidCount = 0

    features.forEach(feature => {
      const value = valueExtractor(feature)
      let surfaceArea = feature.properties?.[surfaceAreaColumn]

      // If surface area column doesn't exist or is 0, default to 1 (equal weight)
      if (surfaceArea === null || surfaceArea === undefined || isNaN(+surfaceArea) || +surfaceArea === 0) {
        surfaceArea = 1
      }

      if (value !== null && value !== undefined && !isNaN(+value)) {
        const numValue = +value
        const numSurfaceArea = +surfaceArea

        // Use raw percentage values directly - no conversion needed
        totalWeightedSum += numValue * numSurfaceArea
        totalSurfaceArea += numSurfaceArea
        validCount++
      } else {
        invalidCount++
      }
    })
  }

  // If still no valid data after all attempts, return "Geen data"
  if (validCount === 0 || totalSurfaceArea === 0) {
    return "Geen data"
  }

  return totalWeightedSum / totalSurfaceArea
}