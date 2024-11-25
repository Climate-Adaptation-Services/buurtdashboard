import { t } from "$lib/i18n/translate";

export function getClassByIndicatorValue(indicator, value){
  if(value === null){return t("Geen_data")}
  let kl = ''
  Object.keys(indicator.klassen).reverse().forEach(klasse => {
    if(value < indicator.klassen[klasse]){
      kl = klasse;
    }
  });

  return kl;
}