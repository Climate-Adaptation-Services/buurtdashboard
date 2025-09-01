import { AHNSelecties } from "$lib/stores";

export function setupAHNSelecties(data) {

  let AHNSelectiesTemp = {}
  
  // Process both Dutch and English metadata to ensure all indicators get AHN selections
  const metadataToProcess = data.metadata || []
  const englishMetadataToProcess = data.metadata_english || []
  
  // Process Dutch metadata
  metadataToProcess.forEach(indicator => {
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
  
  // Process English metadata (if it exists and has different titles)
  englishMetadataToProcess.forEach(indicator => {
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