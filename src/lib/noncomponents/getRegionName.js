import { t } from "$lib/i18n/translate"
import { allMunicipalitiesJSONData, selectedNeighbourhoodJSONData, neighbourhoodNameAbbreviation, districtTypeAbbreviation, municipalitySelection, municipalityCodeAbbreviation, municipalityNameAbbreviation } from "$lib/stores"
import { get } from "svelte/store"

export function getRegionName(regio) {
  return (regio === 'Nederland')
    ? t('Nederland')
    : (regio === 'Gemeente')
      ? t("Gemeente") + ' ' + get(allMunicipalitiesJSONData).features.filter(municipality => municipality.properties[get(municipalityCodeAbbreviation)] === get(municipalitySelection))[0].properties[get(municipalityNameAbbreviation)]
      : (regio === 'Buurt')
        ? t('Buurt') + ' ' + get(selectedNeighbourhoodJSONData).properties[get(neighbourhoodNameAbbreviation)]
        : t('Wijktype') + ' ' + get(selectedNeighbourhoodJSONData).properties[get(districtTypeAbbreviation)]
}