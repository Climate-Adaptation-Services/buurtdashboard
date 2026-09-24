import { scaleLinear, scaleOrdinal, extent } from "d3"
import { getRawValue, isValidValue } from "./valueRetrieval"

/**
 * Bouwt de kleurschaal voor een indicator op basis van de zichtbare data.
 *
 * Stond eerst alleen in IndicatorContent.svelte. De kaartmodal kreeg de schaal
 * als prop mee via bind(), en dat is een momentopname: wisselde je daarna van
 * AHN-jaar, dan las de kaart in de modal de nieuwe waarden maar kleurde ze nog
 * met de oude schaal. Door hem hier te delen kunnen beide hem zelf reactief
 * opbouwen.
 *
 * @param {Object} indicator
 * @param {Object|null} relevantData - FeatureCollection waarover de schaal loopt
 * @param {boolean} isDifferenceMode
 */
export function createIndicatorColorScale(indicator, relevantData, isDifferenceMode) {
  if (!indicator) return () => "#cccccc"

  if (!indicator.numerical) {
    // .unknown() zet no-data-waarden op zwart
    return scaleOrdinal().domain(indicator.color.domain).range(indicator.color.range).unknown("#000000")
  }

  if (isDifferenceMode) {
    // Divergerende schaal voor verschilwaarden
    return scaleLinear().domain([-10, -5, 0, 10, 20]).range(["black", "#D73027", "#cccccc", "green", "black"])
  }

  let rangeExtent = [0, 1]
  if (relevantData?.features) {
    const validValues = relevantData.features
      .map((d) => getRawValue(d, indicator))
      .filter((v) => isValidValue(v))
      .map((v) => +v)

    if (validValues.length > 0) {
      rangeExtent = extent(validValues)
    }
  }

  // Werkt met elk aantal kleuren in het palet
  const step = (rangeExtent[1] - rangeExtent[0]) / (indicator.color.range.length - 1)
  const domain = [...Array(indicator.color.range.length).keys()].map((i) => rangeExtent[0] + i * step)

  return scaleLinear().domain(domain).range(indicator.color.range)
}
