import { extent } from "d3";
import { getIndicatorAttribute } from "./getIndicatorAttribute";

/**
 * Calculate the global min and max values across all AHN versions for an indicator
 * This ensures a consistent x-axis extent when viewing different AHN selections in base year mode
 * 
 * @param {Object} indicator - The indicator object
 * @param {Array} neighbourhoodFeatures - Array of neighborhood features with properties
 * @param {Boolean} isDifferenceMode - Whether we're in difference mode
 * @returns {Array|null} - [min, max] extent array or null if in difference mode
 */
export function getGlobalExtent(indicator, neighbourhoodFeatures, isDifferenceMode) {
  // Only calculate if we're not in difference mode
  if (isDifferenceMode) return null;
  
  // Get all possible AHN versions for this indicator
  const ahnVersions = indicator.AHNversie.split(",");
  
  // Calculate min and max across all versions
  let minVal = Infinity;
  let maxVal = -Infinity;
  
  ahnVersions.forEach(ahnVersion => {
    // Get the attribute for this specific AHN version
    const ahnAttribute = getIndicatorAttribute(indicator, indicator.attribute, ahnVersion);
    
    // Filter out null and empty values
    const validData = neighbourhoodFeatures.filter(
      d => d.properties[ahnAttribute] !== null && d.properties[ahnAttribute] !== ""
    );
    
    // Special handling for logarithmic scale indicators
    if (indicator.title === "Groen per inwoner") {
      const validPositiveData = validData.filter(d => +d.properties[ahnAttribute] > 0);
      if (validPositiveData.length > 0) {
        const extentForVersion = extent(validPositiveData, d => +d.properties[ahnAttribute]);
        minVal = Math.min(minVal, extentForVersion[0]);
        maxVal = Math.max(maxVal, extentForVersion[1]);
      }
    } else {
      if (validData.length > 0) {
        const extentForVersion = extent(validData, d => +d.properties[ahnAttribute]);
        minVal = Math.min(minVal, extentForVersion[0]);
        maxVal = Math.max(maxVal, extentForVersion[1]);
      }
    }
  });
  
  return minVal !== Infinity && maxVal !== -Infinity ? [minVal, maxVal] : [0, 1];
}
