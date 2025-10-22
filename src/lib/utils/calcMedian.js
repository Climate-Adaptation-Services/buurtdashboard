import { getIndicatorStore } from '$lib/stores'

/**
 * Apply surface area conversion to a value for a single feature
 * This converts percentages calculated relative to land area to percentages relative to a different surface area
 * @param {number} value - The original value (percentage)
 * @param {Object} feature - The GeoJSON feature
 * @param {string} surfaceAreaColumn - Column name for the target surface area
 * @param {Object} indicator - Indicator object (optional, for BEB variant detection)
 * @returns {number|null} Converted value or null if conversion fails
 */
export const applySurfaceAreaConversion = (value, feature, surfaceAreaColumn, indicator = null) => {
  if (value === null || value === undefined || !surfaceAreaColumn || !feature) {
    return value
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

  let numValue = +value
  const surfaceArea = feature.properties?.[actualSurfaceAreaColumn]

  // If no surface area data, return original value
  if (surfaceArea === null || surfaceArea === undefined || isNaN(+surfaceArea)) {
    // Try fallback to base column if BEB variant was selected
    if (actualSurfaceAreaColumn !== surfaceAreaColumn) {
      const fallbackSurfaceArea = feature.properties?.[surfaceAreaColumn]
      if (fallbackSurfaceArea !== null && fallbackSurfaceArea !== undefined && !isNaN(+fallbackSurfaceArea)) {
        actualSurfaceAreaColumn = surfaceAreaColumn
      } else {
        return value
      }
    } else {
      return value
    }
  }

  const numSurfaceArea = +feature.properties[actualSurfaceAreaColumn]

  // If the percentage is calculated relative to land area but we're using a different
  // surface area (e.g., openbaar or niet-openbaar), we need to convert the percentage
  // The value represents: (actual_area / land_area) * 100
  // We want: (actual_area / surface_area) * 100
  // So: new_value = value * (land_area / surface_area)
  if (actualSurfaceAreaColumn && actualSurfaceAreaColumn !== 'Oppervlakte_Land_m2' && actualSurfaceAreaColumn !== 'Shape_Area') {
    const landAreaColumn = actualSurfaceAreaColumn.includes('_1') ? 'Oppervlakte_Land_m2_1' : 'Oppervlakte_Land_m2'
    const landArea = +feature.properties?.[landAreaColumn]
    if (landArea > 0 && numSurfaceArea > 0) {
      numValue = numValue * (landArea / numSurfaceArea)
    }
  }

  return numValue
}

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
    return "Geen data"
  }

  // Check if we need to apply BEB suffix to surface area column
  let actualSurfaceAreaColumn = surfaceAreaColumn
  let shouldTryFallback = false

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
      shouldTryFallback = true
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
      const surfaceArea = feature.properties?.[surfaceAreaColumn]

      if (value !== null && value !== undefined && !isNaN(+value) &&
          surfaceArea !== null && surfaceArea !== undefined && !isNaN(+surfaceArea)) {
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

  if (totalSurfaceArea === 0) {
    return "Geen data"
  }

  return totalWeightedSum / totalSurfaceArea
}