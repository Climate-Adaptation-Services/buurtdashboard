/**
 * Concise Value Retrieval System
 */

import { get } from 'svelte/store'
import { AHNSelecties, getIndicatorStore } from '$lib/stores'
import { getIndicatorAttribute } from './getIndicatorAttribute.js'
import { getMostCommonClass } from './getMostCommonClass.js'
import { getClassByIndicatorValue } from './getClassByIndicatorValue.js'

// Utilities
export function isValidValue(value) {
  return value !== null && value !== undefined &&
    value !== '' && value !== 'null' && !isNaN(value)
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

// Property access
function getRawValue(feature, indicator, { year, attributeOverride } = {}) {
  let baseAttribute = indicator.attribute

  // Handle unit selection for M2 variants - use the indicator store directly for reactivity
  if (!attributeOverride && indicator.variants && indicator.variants.split(',').includes('M2')) {
    // Get the indicator store for this specific indicator
    const indicatorStore = getIndicatorStore(indicator.title)
    let ahnSelection
    
    // Get the current value from the store
    const unsubscribe = indicatorStore.subscribe(value => {
      ahnSelection = value
    })
    unsubscribe() // Immediately unsubscribe to avoid memory leaks
    
    // Check if unit is m2 (case-insensitive)
    if (ahnSelection?.unit && (ahnSelection.unit.toLowerCase() === 'm2')) {
      baseAttribute = baseAttribute + '_M2'
    }
  }

  const attribute = attributeOverride ||
    (year ? getIndicatorAttribute(indicator, baseAttribute, year) :
      getIndicatorAttribute(indicator, baseAttribute))
  return feature.properties?.[attribute]
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

// AHN selection helper
export function getAHNSelection(indicator) {
  // Use indicator-specific store for proper reactivity
  const indicatorStore = getIndicatorStore(indicator.title)
  let selection = null;
  
  // Get the current value from the store
  const unsubscribe = indicatorStore.subscribe(value => {
    selection = value
  })
  unsubscribe() // Immediately unsubscribe to avoid memory leaks
  
  if (!selection) return { baseYear: '', compareYear: null, isDifference: false, unit: '%' }
  if (typeof selection === 'object') {
    // Ensure unit property exists with default
    return { ...selection, unit: selection.unit || '%' }
  }
  return { baseYear: selection, compareYear: null, isDifference: false, unit: '%' }
}

// Difference calculation
function getDifferenceValue(feature, indicator, { baseYear, compareYear, defaultValue = null } = {}) {
  const ahnSelection = getAHNSelection(indicator)
  const actualBaseYear = baseYear || ahnSelection.baseYear
  const actualCompareYear = compareYear || ahnSelection.compareYear

  if (!actualBaseYear || !actualCompareYear) return defaultValue

  const baseValue = getNumberValue(feature, indicator, { year: actualBaseYear })
  const compareValue = getNumberValue(feature, indicator, { year: actualCompareYear })

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

// Backward compatibility
export { getRawValue, getNumberValue as getNumericalValue, getCategoryValue as getCategoricalValue, getDifferenceValue }
export const getDisplayValue = (feature, indicator, options = {}) => getValue(feature, indicator, { mode: 'display', ...options })
export const getBatchValues = (features, indicator, { valueType = 'display', ...options } = {}) => getValues(features, indicator, { mode: valueType, ...options })

// Utilities
export { getIndicatorAttribute, getMostCommonClass, getClassByIndicatorValue }
