import { jaarSelecties } from "$lib/stores";

export function setupJaarSelecties(data) {

  let jaarSelectiesTemp = {}
  data.metadata.forEach(indicator => {
    jaarSelectiesTemp[indicator.Titel] = (indicator.AHNversie)
      ? indicator.AHNversie.split(',')[indicator.AHNversie.split(',').length - 1]
      : ''
  });
  jaarSelecties.set(jaarSelectiesTemp)
}