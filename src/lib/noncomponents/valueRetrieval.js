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

// Helper function to format M2 values for better readability
function formatM2Value(value) {
  if (value === null || value === undefined || isNaN(value)) return null
  
  const absValue = Math.abs(value)
  
  // Format large numbers with thousand separators and appropriate units
  if (absValue >= 1000000) {
    const millions = value / 1000000
    return `${millions.toFixed(1).replace(/\.0$/, '')}M`
  } else if (absValue >= 1000) {
    const thousands = value / 1000
    return `${thousands.toFixed(1).replace(/\.0$/, '')}k`
  } else {
    return Math.round(value * 100) / 100
  }
}

// Property access
function getRawValue(feature, indicator, { year, attributeOverride, forceM2 = false } = {}) {
  let baseAttribute = indicator.attribute

  // Only handle M2 variants for popups when explicitly requested
  if (!attributeOverride && forceM2 && indicator.variants && indicator.variants.split(',').includes('M2')) {
    baseAttribute = baseAttribute + '_M2'
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
  
  if (!selection) return { baseYear: '', compareYear: null, isDifference: false }
  if (typeof selection === 'object') {
    return { baseYear: selection.baseYear || '', compareYear: selection.compareYear || null, isDifference: selection.isDifference || false }
  }
  return { baseYear: selection, compareYear: null, isDifference: false }
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

// Special function for popup tooltips that can show both percentage and M2 values when variant is M2
export function getPopupValue(feature, indicator, options = {}) {
  const ahnSelection = getAHNSelection(indicator)
  const isDifferenceMode = ahnSelection && ahnSelection.isDifference
  
  if (isDifferenceMode) {
    // Handle difference mode for both regular and M2 values
    const regularDiff = getDifferenceValue(feature, indicator, options)
    
    if (indicator.variants && indicator.variants.split(',').includes('M2')) {
      const m2Diff = getDifferenceValue(feature, indicator, { ...options, forceM2: true })
      if (regularDiff !== null && m2Diff !== null) {
        return {
          value: regularDiff,
          unit: '%',
          m2Value: m2Diff,
          hasM2: true,
          isDifference: true
        }
      }
    }
    
    return { value: regularDiff, unit: '%', hasM2: false, isDifference: true }
  } else {
    // Regular mode
    const regularValue = getNumberValue(feature, indicator, options)
    
    // For M2 variants, show both percentage and M2 values
    if (indicator.variants && indicator.variants.split(',').includes('M2')) {
      const m2Value = getNumberValue(feature, indicator, { ...options, forceM2: true })
      if (regularValue !== null && m2Value !== null) {
        return { 
          value: regularValue, 
          unit: '%',
          m2Value: m2Value,
          hasM2: true,
          isDifference: false
        }
      }
    }
    
    // Fallback to regular value with % symbol only
    return { value: regularValue, unit: '%', hasM2: false, isDifference: false }
  }
}

// Backward compatibility
export { getRawValue, getNumberValue as getNumericalValue, getCategoryValue as getCategoricalValue, getDifferenceValue }
export const getDisplayValue = (feature, indicator, options = {}) => getValue(feature, indicator, { mode: 'display', ...options })
export const getBatchValues = (features, indicator, { valueType = 'display', ...options } = {}) => getValues(features, indicator, { mode: valueType, ...options })

// Utilities
export { getIndicatorAttribute, getMostCommonClass, getClassByIndicatorValue, formatM2Value }
