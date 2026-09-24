// Standaard randkleur voor de geselecteerde buurt, in kaart en beeswarm
const DEFAULT_SELECTION_STROKE = "#E1575A"

// Waterdiepte bij extreme regen gebruikt een rood palet (#FFBDBE tot #280000).
// De standaardkleur is zelf een rood en valt daar weg: 1,09:1 tegen #FF0000.
// Dit blauw haalt minimaal 1,52:1 en mediaan 3,34:1 over dat palet.
const WATERDIEPTE_SELECTION_STROKE = "#1D44B8"

// dutchTitle in plaats van title: die is taalonafhankelijk en wordt in deze
// codebase ook als sleutel voor de per-indicator stores gebruikt.
const WATERDIEPTE_PREFIX = "Waterdiepte bij extreme regen"

/**
 * Randkleur voor de geselecteerde buurt. Alleen de waterdiepte-indicatoren
 * wijken af; alle andere houden de standaard rode kleur.
 */
export function getSelectionStroke(indicator) {
  const title = indicator?.dutchTitle || indicator?.title || ""
  return title.startsWith(WATERDIEPTE_PREFIX)
    ? WATERDIEPTE_SELECTION_STROKE
    : DEFAULT_SELECTION_STROKE
}
