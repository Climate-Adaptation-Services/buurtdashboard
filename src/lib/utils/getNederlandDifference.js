/**
 * Haalt de voorberekende Nederland-verschilwaarde uit de aggregaten.
 *
 * Het precalculate-script slaat die op als `diff_<base>_<compare>`, met de mediaan
 * van (compare - base) over alle buurten. Alleen paren in oplopende volgorde staan
 * erin, dus de omgekeerde richting is hetzelfde getal met een minteken.
 *
 * Stats sloeg de cache in verschilmodus helemaal over en rekende het zelf uit over
 * alle buurten. Dat kan sinds de per-gemeente-lading niet meer.
 *
 * @param {Object} cached - het aggregaat-object voor deze indicator (en BEB-variant)
 * @param {string} baseYear - bijv. "AHN3"
 * @param {string} compareYear - bijv. "AHN5"
 * @returns {number|null}
 */
export function getNederlandDifference(cached, baseYear, compareYear) {
  if (!cached || typeof cached !== "object" || !baseYear || !compareYear) return null
  if (baseYear === compareYear) return null

  const direct = cached[`diff_${baseYear}_${compareYear}`]
  if (typeof direct === "number") return direct

  const reversed = cached[`diff_${compareYear}_${baseYear}`]
  if (typeof reversed === "number") return -reversed

  return null
}
