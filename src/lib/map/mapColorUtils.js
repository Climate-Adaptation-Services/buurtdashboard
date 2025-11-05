/**
 * Map Color Utilities - Handles color calculation logic for map features
 * Extracted from Map.svelte to improve organization and reusability
 */

import {
  getNumericalValue,
  getCategoricalValue,
  getDifferenceValue,
  getAHNSelection,
  getRawValue,
} from "../utils/valueRetrieval.js"
import { getIndicatorAttribute } from "../utils/getIndicatorAttribute.js"

/**
 * Pre-calculate difference values for map features to match BeeswarmPlot approach
 */
export function calculateDifferenceValues(currentJSONData, indicator, indicatorStore, neighbourhoodCodeAbbreviation) {
  const isDifferenceMode = indicatorStore && typeof indicatorStore === "object" && indicatorStore.isDifference

  if (!isDifferenceMode || !indicator || !indicatorStore || !currentJSONData?.features) {
    return null
  }

  return currentJSONData.features.map((d) => {
    const diffValue = getDifferenceValue(d, indicator)
    // Return the feature id and its difference value for lookup
    return {
      id: d.properties[neighbourhoodCodeAbbreviation],
      diffValue: diffValue,
    }
  })
}

/**
 * Calculate indicator attributes for both display and coloring
 */
export function calculateIndicatorAttributes(indicator, indicatorStore) {
  if (!indicator || !indicatorStore) {
    return {
      indicatorAttribute: null,
      originalAttribute: null
    }
  }

  // For display: use reactive attribute (may include _M2 suffix based on unit selection)
  const indicatorAttribute = getIndicatorAttribute(indicator, indicator.attribute)

  // For colors: always use original percentage attribute (consistent with BeeswarmPlot)
  let originalAttribute
  if (indicatorStore && indicatorStore.baseYear) {
    originalAttribute = indicator.attribute + "_" + indicatorStore.baseYear
  } else {
    originalAttribute = indicator.attribute
  }

  return {
    indicatorAttribute,
    originalAttribute
  }
}

/**
 * Get fill color for a map feature - ALIGNED with BeeswarmPlot's color logic
 */
export function getMapFillColor(feature, indicator, isDifferenceMode, differenceValues, neighbourhoodSelection, neighbourhoodCodeAbbreviation, indicatorValueColorscale) {
  // Check if this is the main map (no indicator) - use whitesmoke
  if (!indicator) {
    return neighbourhoodSelection === feature.properties[neighbourhoodCodeAbbreviation] ? "#E1575A" : "whitesmoke"
  }

  if (indicator.numerical) {
    // Get feature ID for difference value lookup
    const featureId = feature.properties[neighbourhoodCodeAbbreviation]

    if (isDifferenceMode && differenceValues) {
      // Find pre-calculated difference value from our lookup array
      const diffRecord = differenceValues.find((d) => d.id === featureId)
      const diffValue = diffRecord ? diffRecord.diffValue : null

      // Color based on difference value, matching BeeswarmPlot behavior
      return diffValue !== null && diffValue !== "" && !isNaN(diffValue) ? indicatorValueColorscale(diffValue) : "#000000"
    } else {
      // For non-difference mode, use the value retrieval system for BEB-aware coloring
      // This matches BeeswarmPlot which now uses: getRawValue(node, indicator)
      let value = getRawValue(feature, indicator)

      return value !== null && value !== "" && !isNaN(value) ? indicatorValueColorscale(value) : "#000000"
    }
  } else {
    // Use centralized categorical value retrieval
    const categoricalValue = getCategoricalValue(feature, indicator)
    return categoricalValue !== null ? indicatorValueColorscale(categoricalValue) : "#000000"
  }
}