import { AHNSelecties } from "$lib/stores";

export function setupAHNSelecties(data) {

  let AHNSelectiesTemp = {}

  // Process both Dutch and English indicators config to ensure all indicators get AHN selections
  const indicatorsConfigToProcess = data.indicatorsConfig || []
  const englishIndicatorsConfigToProcess = data.indicatorsConfig_english || []

  // Process Dutch indicators config
  indicatorsConfigToProcess.forEach(indicator => {
    const baseYear = (indicator.AHNversie)
      ? indicator.AHNversie.split(',')[indicator.AHNversie.split(',').length - 1]
      : ''
    
    // Use the consistent object structure
    AHNSelectiesTemp[indicator.Titel] = {
      baseYear: baseYear,
      compareYear: null,
      isDifference: false
    }
  });

  // Process English indicators config (if it exists and has different titles)
  englishIndicatorsConfigToProcess.forEach(indicator => {
    const baseYear = (indicator.AHNversie)
      ? indicator.AHNversie.split(',')[indicator.AHNversie.split(',').length - 1]
      : ''
    
    // Use the consistent object structure
    AHNSelectiesTemp[indicator.Titel] = {
      baseYear: baseYear,
      compareYear: null,
      isDifference: false
    }
  });
  
  AHNSelecties.set(AHNSelectiesTemp)
}