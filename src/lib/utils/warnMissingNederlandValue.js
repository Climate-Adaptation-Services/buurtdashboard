const alreadyWarned = new Set()

/**
 * Meldt dat een Nederland-waarde niet in de voorberekende aggregaten zit.
 *
 * Hier stond eerder een terugval die het landelijke cijfer alsnog uitrekende over
 * allNeighbourhoodsJSONData. Sinds de data per gemeente wordt geladen bevat die
 * store buiten de gekozen gemeente geen indicatorwaarden meer, dus die berekening
 * levert een veel te laag getal op - stil en plausibel ogend.
 *
 * Dat gebeurde toen "Waterdiepte bij extreme regen" in het Config Portal werd
 * hernoemd naar "Waterdiepte bij korte extreme regen": de sleutel matchte niet
 * meer en de balk toonde onzin in plaats van niets.
 *
 * Liever geen Nederland-regel dan een verkeerde. Meestal betekent deze melding:
 * draai `npm run precalculate-nederland` opnieuw.
 */
export function warnMissingNederlandValue(indicator, context) {
  const key = (indicator?.dutchTitle || indicator?.title || "?") + "|" + context
  if (alreadyWarned.has(key)) return
  alreadyWarned.add(key)

  console.warn(
    `[${context}] Geen voorberekende Nederland-waarde voor "${indicator?.dutchTitle || indicator?.title}". ` +
      `De Nederland-regel wordt overgeslagen. Is de indicator hernoemd of toegevoegd? ` +
      `Draai dan: VITE_CONFIG_MODE=dev npm run precalculate-nederland`
  )
}
