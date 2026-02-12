/**
 * Concise Value Retrieval System
 */

import { get } from 'svelte/store'
import { AHNSelecties, getIndicatorStore } from '$lib/stores'
import { getIndicatorAttribute } from './getIndicatorAttribute.js'
import { getMostCommonClass } from './getMostCommonClass.js'
import { getClassByIndicatorValue } from './getClassByIndicatorValue.js'
import { getPropertyWithAHNFallback } from './resolveAHNColumnName.js'

// No-data code meanings - single source of truth
// -9991: No slow traffic route in this neighbourhood
// -9995: No AHN5 data available
// -9999: No built-up area (bebouwde kom) in this neighbourhood
export const NO_DATA_CODES = {
  '-9991': 'no_slow_traffic_route',
  '-9995': 'no_ahn5_data',
  '-9999': 'no_bebouwde_kom'
}

// List of all specific no-data reason keys (for checking if a value is a no-data reason)
export const NO_DATA_REASON_KEYS = Object.values(NO_DATA_CODES)

// Get the specific reason for no-data based on the code
export function getNoDataReason(value) {
  if (value === null || value === undefined || value === '' || value === 'null') {
    return 'no_data'
  }
  const numValue = typeof value === 'number' ? value : parseFloat(value)
  if (isNaN(numValue)) return 'no_data'

  const reason = NO_DATA_CODES[String(Math.round(numValue))]
  return reason || null // Return reason if found, null if value is valid
}

// Check if a value is a specific no-data reason (not generic 'no_data' or 'No data')
export function isSpecificNoDataReason(value) {
  return NO_DATA_REASON_KEYS.includes(value)
}

// Check if a value is any kind of no-data (specific reason, generic, or 'No data')
export function isAnyNoData(value) {
  return value === 'No data' || value === 'no_data' || NO_DATA_REASON_KEYS.includes(value)
}

// Utilities
export function isValidValue(value) {
  if (value === null || value === undefined || value === '' || value === 'null') {
    return false
  }
  if (isNaN(value)) {
    return false
  }
  // Check if value is a no-data code using centralized lookup
  const numValue = typeof value === 'number' ? value : parseFloat(value)
  return !NO_DATA_CODES[String(Math.round(numValue))]
}

export function toNumber(value, defaultValue = null) {
  if (!isValidValue(value)) return defaultValue
  const num = typeof value === 'number' ? value : parseFloat(value)
  return isNaN(num) ? defaultValue : num
}

export function formatValue(value, { decimals = 2, showSign = false, nullText = 'Geen data' } = {}) {
  if (!isValidValue(value)) return nullText
  const num = toNumber(value)
  if (num === null) return nullText
  const formatted = num.toFixed(decimals)
  return showSign && num > 0 ? `+${formatted}` : formatted
}

// Helper function to format M2 values for better readability
function formatM2Value(value) {
  if (value === null || value === undefined || isNaN(value)) return null

  const absValue = Math.abs(value)
  const isNegative = value < 0

  // Format large numbers with thousand separators (Dutch format: dots as thousand separator)
  if (absValue >= 1000) {
    // Round to whole number for readability
    const rounded = Math.round(absValue)
    // Add thousand separators (dots in Dutch format)
    const formatted = rounded.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')
    return isNegative ? `-${formatted}` : formatted
  } else {
    return Math.round(value * 100) / 100
  }
}

// Property access
function getRawValue(feature, indicator, { year, attributeOverride, forceM2 = false, forceBEB = null } = {}) {
  let baseAttribute = indicator.attribute

  // Only handle M2 variants for popups when explicitly requested (handle spaces)
  if (!attributeOverride && forceM2 && indicator.variants && indicator.variants.split(',').map(v => v.trim()).includes('M2')) {
    baseAttribute = baseAttribute + '_M2'
  }

  // Let getIndicatorAttribute handle BEB suffixes - it will check the indicator store
  // and apply the correct order: attribute_AHN3_BK
  const attribute = attributeOverride ||
    (year ? getIndicatorAttribute(indicator, baseAttribute, year) :
      getIndicatorAttribute(indicator, baseAttribute))

  // Use centralized AHN column name resolution (handles Dordrecht naming differences)
  return getPropertyWithAHNFallback(attribute, feature.properties)
}

function getNumberValue(feature, indicator, options = {}) {
  return toNumber(getRawValue(feature, indicator, options), options.defaultValue)
}

function getCategoryValue(feature, indicator, { defaultValue = 'No data', ...options } = {}) {
  if (indicator.aggregatedIndicator) {
    return getMostCommonClass(indicator, feature) || defaultValue
  }

  const rawValue = getRawValue(feature, indicator, options)
  if (!isValidValue(rawValue) || !indicator?.classes) return defaultValue

  try {
    return getClassByIndicatorValue(indicator, rawValue) || defaultValue
  } catch {
    return defaultValue
  }
}

// AHN selection helper - uses per-indicator store
export function getAHNSelection(indicator) {
  // Use indicator-specific store for proper reactivity
  // Use dutchTitle for store key to ensure consistency across languages
  const indicatorStore = getIndicatorStore(indicator.dutchTitle || indicator.title)
  const selection = get(indicatorStore)

  if (!selection) return { baseYear: '', compareYear: null, isDifference: false, beb: 'hele_buurt' }
  if (typeof selection === 'object') {
    return {
      baseYear: selection.baseYear || '',
      compareYear: selection.compareYear || null,
      isDifference: selection.isDifference || false,
      beb: selection.beb || 'hele_buurt'
    }
  }
  return { baseYear: selection, compareYear: null, isDifference: false, beb: 'hele_buurt' }
}

// Difference calculation - now supports M2 variants
function getDifferenceValue(feature, indicator, { baseYear, compareYear, defaultValue = null, forceM2 = false } = {}) {
  const ahnSelection = getAHNSelection(indicator)
  const actualBaseYear = baseYear || ahnSelection.baseYear
  const actualCompareYear = compareYear || ahnSelection.compareYear

  if (!actualBaseYear || !actualCompareYear) return defaultValue

  const baseValue = getNumberValue(feature, indicator, { year: actualBaseYear, forceM2 })
  const compareValue = getNumberValue(feature, indicator, { year: actualCompareYear, forceM2 })

  return (baseValue !== null && compareValue !== null) ? compareValue - baseValue : defaultValue
}

// Main API
export function getValue(feature, indicator, {
  mode = 'auto', format = false, year, baseYear, compareYear, defaultValue, ...formatOptions
} = {}) {
  // Auto-detect mode
  if (mode === 'auto') {
    const ahnSelection = getAHNSelection(indicator)
    mode = ahnSelection.isDifference ? 'difference' : indicator.numerical ? 'number' : 'category'
  }

  // Get value by mode
  let value
  switch (mode) {
    case 'number':
      value = getNumberValue(feature, indicator, { year, defaultValue })
      break
    case 'category':
      value = getCategoryValue(feature, indicator, { year, defaultValue: defaultValue || 'No data' })
      break
    case 'difference':
      value = getDifferenceValue(feature, indicator, { baseYear, compareYear, defaultValue })
      break
    case 'display':
      if (indicator.numerical) {
        const ahnSelection = getAHNSelection(indicator)
        value = ahnSelection.isDifference ?
          getDifferenceValue(feature, indicator, { baseYear, compareYear, defaultValue }) :
          getNumberValue(feature, indicator, { year, defaultValue })
        return formatValue(value, { showSign: ahnSelection.isDifference, ...formatOptions })
      }
      return getCategoryValue(feature, indicator, { year, defaultValue: defaultValue || 'No data' })
    default:
      throw new Error(`Unknown mode: ${mode}`)
  }

  return format && typeof value === 'number' ?
    formatValue(value, { showSign: mode === 'difference', ...formatOptions }) : value
}

export function getValues(features, indicator, options = {}) {
  return features.map(feature => getValue(feature, indicator, options))
}

export function getMultipleValues(feature, indicator, { types = ['number', 'category'], ...options } = {}) {
  const result = {}
  types.forEach(type => result[type] = getValue(feature, indicator, { mode: type, ...options }))
  return result
}

// Helper function to get surface area from feature based on indicator.surfaceArea column
function getSurfaceAreaM2(feature, indicator) {
  // Only return surface area if indicator has surfaceArea defined
  if (!indicator.surfaceArea || !feature.properties) {
    return null
  }

  let surfaceAreaColumn = indicator.surfaceArea

  // Special handling for "Totale buurt" - map to standard column
  if (surfaceAreaColumn === 'Totale buurt') {
    surfaceAreaColumn = 'Oppervlakte_Land_m2'
  }

  // Check if we need to apply BEB suffix to surface area column
  const surfaceVariants = indicator.variants ? indicator.variants.split(',').map(v => v.trim()) : []
  const surfaceBebVariant = surfaceVariants.find(v => v !== 'M2' && v !== '') // Find the BEB variant (not M2)

  if (surfaceBebVariant) {
    // Use dutchTitle for store key to ensure consistency across languages
    const indicatorStore = getIndicatorStore(indicator.dutchTitle || indicator.title)
    const ahnSelection = get(indicatorStore)

    const bebSelection = ahnSelection?.beb || 'hele_buurt'
    if (bebSelection === 'bebouwde_kom') {
      const bebColumn = surfaceAreaColumn + '_' + surfaceBebVariant
      // Try BEB variant first, fall back to base column if not available
      const bebValue = feature.properties[bebColumn]
      if (bebValue !== null && bebValue !== undefined && !isNaN(bebValue)) {
        surfaceAreaColumn = bebColumn
      }
    }
  }

  const surfaceArea = feature.properties[surfaceAreaColumn]
  return toNumber(surfaceArea)
}

// Special function for popup tooltips that can show both percentage and M2 values
// M2 values are calculated from percentage × surfaceArea when surfaceArea is defined
export function getPopupValue(feature, indicator, options = {}) {
  const ahnSelection = getAHNSelection(indicator)
  const isDifferenceMode = ahnSelection && ahnSelection.isDifference

  if (isDifferenceMode) {
    // Handle difference mode with M2 calculation
    const regularDiff = getDifferenceValue(feature, indicator, options)

    // Calculate M2 from percentage difference × surface area (ONLY if surfaceArea is defined)
    if (indicator.surfaceArea && regularDiff !== null) {
      const surfaceAreaM2 = getSurfaceAreaM2(feature, indicator)
      if (surfaceAreaM2 !== null) {
        const m2Diff = (regularDiff / 100) * surfaceAreaM2
        return {
          value: regularDiff,
          unit: indicator.plottitle.startsWith('%') ? '%' : '',
          m2Value: m2Diff,
          hasM2: true,
          isDifference: true
        }
      }
    }

    return { value: regularDiff, unit: indicator.plottitle.startsWith('%') ? '%' : '', hasM2: false, isDifference: true }
  } else {
    // Regular mode
    const regularValue = getNumberValue(feature, indicator, options)

    // Calculate M2 from percentage × surface area (ONLY if surfaceArea is defined)
    if (indicator.surfaceArea && regularValue !== null) {
      const surfaceAreaM2 = getSurfaceAreaM2(feature, indicator)
      if (surfaceAreaM2 !== null) {
        const m2Value = (regularValue / 100) * surfaceAreaM2
        return {
          value: regularValue,
          unit: indicator.plottitle.startsWith('%') ? '%' : '',
          m2Value: m2Value,
          hasM2: true,
          isDifference: false
        }
      }
    }

    // Fallback to regular value with % symbol only
    return { value: regularValue, unit: indicator.plottitle.startsWith('%') ? '%' : '', hasM2: false, isDifference: false }
  }
}

// Backward compatibility
export { getRawValue, getNumberValue as getNumericalValue, getCategoryValue as getCategoricalValue, getDifferenceValue }
export const getDisplayValue = (feature, indicator, options = {}) => getValue(feature, indicator, { mode: 'display', ...options })
export const getBatchValues = (features, indicator, { valueType = 'display', ...options } = {}) => getValues(features, indicator, { mode: valueType, ...options })

// Utilities
export { getIndicatorAttribute, getMostCommonClass, getClassByIndicatorValue, formatM2Value }
