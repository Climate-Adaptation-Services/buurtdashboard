import { AHNSelecties } from "$lib/stores";

export function setupAHNSelecties(data) {

  let AHNSelectiesTemp = {}

  // Process Dutch indicators config (always use Dutch as source of truth)
  const indicatorsConfigToProcess = data.indicatorsConfig || []

  indicatorsConfigToProcess.forEach(indicator => {
    const baseYear = (indicator.AHNversie)
      ? indicator.AHNversie.split(',')[indicator.AHNversie.split(',').length - 1]
      : ''

    // Use the consistent object structure
    // Key by Dutch title since that's what's used for lookups
    AHNSelectiesTemp[indicator.Titel] = {
      baseYear: baseYear,
      compareYear: null,
      isDifference: false
    }
  });

  AHNSelecties.set(AHNSelectiesTemp)
}
