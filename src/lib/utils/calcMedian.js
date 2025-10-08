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
 * Calculate weighted average based on surface area
 * @param {Array} features - Array of GeoJSON features
 * @param {Function} valueExtractor - Function to extract value from feature
 * @param {string} surfaceAreaColumn - Column name for surface area
 * @param {Object} indicator - Indicator object (optional, for BEB variant detection)
 * @returns {number|string} Weighted average or "Geen data" if no valid data
 */
export const calcWeightedAverage = (features, valueExtractor, surfaceAreaColumn, indicator = null) => {
  if (!features || features.length === 0 || !surfaceAreaColumn) {
    console.log('🔍 calcWeightedAverage: No features or surfaceAreaColumn', {
      hasFeatures: !!features,
      featuresLength: features?.length,
      surfaceAreaColumn
    })
    return "Geen data"
  }

  // Check if we need to apply BEB suffix to surface area column
  let actualSurfaceAreaColumn = surfaceAreaColumn
  if (indicator && indicator.variants && indicator.variants.split(',').map(v => v.trim()).includes('1')) {
    const indicatorStore = getIndicatorStore(indicator.title)
    let ahnSelection

    const unsubscribe = indicatorStore.subscribe(value => {
      ahnSelection = value
    })
    unsubscribe()

    const bebSelection = ahnSelection?.beb || 'hele_buurt'
    if (bebSelection === 'bebouwde_kom') {
      actualSurfaceAreaColumn = surfaceAreaColumn + '_1'
    }
  }

  let totalWeightedSum = 0
  let totalSurfaceArea = 0
  let validCount = 0
  let invalidCount = 0

  features.forEach(feature => {
    const value = valueExtractor(feature)
    const surfaceArea = feature.properties?.[actualSurfaceAreaColumn]

    if (value !== null && value !== undefined && !isNaN(+value) &&
        surfaceArea !== null && surfaceArea !== undefined && !isNaN(+surfaceArea)) {
      const numValue = +value
      const numSurfaceArea = +surfaceArea
      totalWeightedSum += numValue * numSurfaceArea
      totalSurfaceArea += numSurfaceArea
      validCount++
    } else {
      invalidCount++
    }
  })

  console.log('🔍 calcWeightedAverage results:', {
    surfaceAreaColumn,
    actualSurfaceAreaColumn,
    validCount,
    invalidCount,
    totalSurfaceArea,
    totalWeightedSum,
    result: totalSurfaceArea > 0 ? totalWeightedSum / totalSurfaceArea : "Geen data"
  })

  if (totalSurfaceArea === 0) {
    return "Geen data"
  }

  return totalWeightedSum / totalSurfaceArea
}