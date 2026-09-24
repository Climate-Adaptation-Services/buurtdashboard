import { hsl } from "d3"

// Standaard randkleur voor de geselecteerde buurt
const DEFAULT_SELECTION_STROKE = "#E1575A"
// Alternatief bij een rood of roze palet, waar de standaardkleur wegvalt
const RED_PALETTE_SELECTION_STROKE = "#1A1A1A"

/**
 * Is het kleurenpalet van deze indicator overwegend rood of roze?
 *
 * De standaard selectiekleur #E1575A is zelf een rood en verdwijnt daar in de
 * vulling: 1,09:1 tegen het rood van waterdiepte, 1,01:1 tegen het roze van
 * ervaren koelte. Bijna-zwart haalt daar een mediaan van 6,91:1.
 */
function hasRedPalette(indicator) {
  const range = indicator?.color?.range
  if (!Array.isArray(range) || range.length === 0) return false

  let saturated = 0
  let reddish = 0
  for (const entry of range) {
    const c = hsl(entry)
    if (!c || isNaN(c.h) || c.s < 0.15) continue // grijstinten tellen niet mee
    saturated++
    // Rood loopt door in roze/magenta: 320-360 en 0-25 graden
    if (c.h >= 320 || c.h <= 25) reddish++
  }

  return saturated > 0 && reddish / saturated >= 0.5
}

export function getSelectionStroke(indicator) {
  return hasRedPalette(indicator) ? RED_PALETTE_SELECTION_STROKE : DEFAULT_SELECTION_STROKE
}
