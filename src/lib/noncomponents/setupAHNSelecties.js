import { AHNSelecties } from "$lib/stores";

export function setupAHNSelecties(data) {

  let AHNSelectiesTemp = {}
  data.metadata.forEach(indicator => {
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