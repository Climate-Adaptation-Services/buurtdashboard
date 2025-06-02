import { AHNSelecties } from "$lib/stores";

export function setupAHNSelecties(data) {
  let AHNSelectiesTemp = {}

  // Use metadata_dordrecht instead of metadata
  data.metadata_dordrecht.forEach(indicator => {
    AHNSelectiesTemp[indicator.Titel] = (indicator.AHNversie)
      ? indicator.AHNversie.split(',')[indicator.AHNversie.split(',').length - 1]
      : ''
  });
  AHNSelecties.set(AHNSelectiesTemp)
}