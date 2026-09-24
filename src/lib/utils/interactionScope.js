import { select } from "d3"

/**
 * Klassenamen voor kaarten, beeswarms en barplots zijn afgeleid van indicator.title.
 * Staat dezelfde indicator twee keer in de DOM - in de tegel en in de kaartmodal -
 * dan vinden lookups op die klasse twee elementen, en pakken ze standaard de eerste
 * (die in de tegel). Tooltips landen dan op de verkeerde plek en highlights op de
 * verkeerde kaart.
 *
 * Zolang de modal open is, is die het enige waarmee de gebruiker kan interacteren.
 * Daarom zoeken we in dat geval binnen de modal in plaats van in het hele document.
 */
export function interactionRoot() {
  if (typeof document === "undefined") return null
  return document.querySelector("[data-map-modal]") || document
}

export function scopedSelect(selector) {
  return select(interactionRoot()).select(selector)
}

export function scopedSelectAll(selector) {
  return select(interactionRoot()).selectAll(selector)
}

export function scopedElementByClass(className) {
  const root = interactionRoot()
  return root ? root.getElementsByClassName(className)[0] : undefined
}
