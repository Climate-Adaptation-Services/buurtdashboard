import { t } from "$lib/i18n/translate";

export function getClassByIndicatorValue(indicator, value){
  if(value === null){return t("Geen_data")}
  let kl = ''
  Object.keys(indicator.classes).reverse().forEach(klasse => {
    if(value < indicator.classes[klasse]){
      kl = klasse;
    }
  });

  return kl;
}