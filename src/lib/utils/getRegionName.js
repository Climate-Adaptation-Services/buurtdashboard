import { t } from "$lib/i18n/translate"
import { allMunicipalitiesJSONData, selectedNeighbourhoodJSONData, neighbourhoodNameAbbreviation, districtTypeAbbreviation, municipalitySelection, municipalityCodeAbbreviation, municipalityNameAbbreviation } from "$lib/stores"
import { get } from "svelte/store"

export function getRegionName(regio) {
  if (regio === 'Nederland') {
    return t('Nederland')
  }

  if (regio === 'Gemeente') {
    const municipalities = get(allMunicipalitiesJSONData)
    const selectedMunicipality = municipalities?.features?.filter(
      municipality => municipality.properties[get(municipalityCodeAbbreviation)] === get(municipalitySelection)
    )[0]
    return selectedMunicipality
      ? t("Gemeente") + ' ' + selectedMunicipality.properties[get(municipalityNameAbbreviation)]
      : t("Gemeente")
  }

  if (regio === 'Buurt') {
    const neighbourhood = get(selectedNeighbourhoodJSONData)
    return neighbourhood
      ? t('Buurt') + ' ' + neighbourhood.properties[get(neighbourhoodNameAbbreviation)]
      : t('Buurt')
  }

  // Wijktype
  const neighbourhood = get(selectedNeighbourhoodJSONData)
  return neighbourhood
    ? t('Wijktype') + ' ' + neighbourhood.properties[get(districtTypeAbbreviation)]
    : t('Wijktype')
}
