import { AHNSelecties } from "$lib/stores"
import { get } from "svelte/store"

export function getIndicatorAttribute(indicator, attribute) {
  const ahnSelection = get(AHNSelecties)[indicator.title]
  
  if (!ahnSelection) {
    return attribute
  }
  
  // Check if this is a difference calculation (object with isDifference property)
  if (ahnSelection && typeof ahnSelection === 'object' && ahnSelection.isDifference) {
    // For difference calculation, return the base year attribute
    // The actual difference calculation will be done in the BeeswarmPlot component
    return attribute + ahnSelection.baseYear
  } else {
    // Regular single year selection
    return attribute + ahnSelection
  }
}