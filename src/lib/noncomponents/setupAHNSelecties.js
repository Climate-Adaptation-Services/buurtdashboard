import { AHNSelecties } from "$lib/stores";

export function setupAHNSelecties(data) {

  let AHNSelectiesTemp = {}
  data.metadata.forEach(indicator => {
    AHNSelectiesTemp[indicator.Titel] = (indicator.AHNversie)
      ? indicator.AHNversie.split(',')[indicator.AHNversie.split(',').length - 1]
      : ''
  });
  AHNSelecties.set(AHNSelectiesTemp)
}