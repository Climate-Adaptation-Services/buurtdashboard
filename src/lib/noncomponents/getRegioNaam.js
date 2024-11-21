import { t } from "$lib/i18n/translate"
import { alleGemeentesJSONData, geselecteerdeBuurtJSONData, buurtNaamAfkorting, wijktypeAfkorting, gemeenteSelection, gemeenteNaamAfkorting } from "$lib/stores"
import { get } from "svelte/store"

export function getRegioNaam(regio){
  return (regio === 'Nederland')
? t('Nederland')
: (regio === 'Gemeente')
  ? t("Gemeente") + ' ' + get(alleGemeentesJSONData).features.filter(gemeente => gemeente.properties['GM_CODE'] === get(gemeenteSelection))[0].properties[get(gemeenteNaamAfkorting)]
  : (regio === 'Buurt')
    ? t('Buurt') + ' ' + get(geselecteerdeBuurtJSONData).properties[get(buurtNaamAfkorting)]
    : t('Wijktype') + ' ' + get(geselecteerdeBuurtJSONData).properties[get(wijktypeAfkorting)]
}