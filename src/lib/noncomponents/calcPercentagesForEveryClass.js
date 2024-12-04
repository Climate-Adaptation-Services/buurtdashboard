import { getClassByIndicatorValue } from "./getClassByIndicatorValue";
import { t } from "$lib/i18n/translate";

export function calcPercentagesForEveryClassMultiIndicator(indicator, data, regio){
  let totalSurfaceArea = 0
  let totalSumPerClass = []

  // object om totale som van elke klasse in op te tellen
  for(let i=0;i<Object.keys(indicator.classes).length;i++){
    totalSumPerClass.push({
      className: Object.keys(indicator.classes)[i], 
      som:0
    })
  }

  // voor elke neighbourhood gaan we de waardes van elke klasse bij de som van die klasse toevoegen
  data.features.forEach(neighbourhood => {
    let neighbourhoodOppervlakte = (indicator.title === 'Functionele gebieden')
      ? neighbourhood.properties['buurt_opp_incl_agrarisch']
      : neighbourhood.properties['buurt_opp_zonderagr']

    totalSurfaceArea += neighbourhoodOppervlakte

    if(indicator.title === t('Gevoelstemperatuur')){totalSurfaceArea -= neighbourhoodOppervlakte * neighbourhood.properties['NDPETperc']}
    
    // voor deze neighbourhood tel de waardes van elke klasse bij de totale som op
    Object.keys(indicator.classes).forEach(kl => {
      // is dit goed zo of moeten we anders met no data (NaN) omgaan
      if(neighbourhood.properties[indicator.classes[kl]] && !isNaN(parseFloat(neighbourhood.properties[indicator.classes[kl]]))){
        // pak de klasse erbij in totalSumPerClass
        const tempKlasse = totalSumPerClass.filter(kl2 => kl2.className === kl)[0]
        // we wegen ook voor het oppervlakte met neighbourhoodOppervlakte
        tempKlasse.som += neighbourhoodOppervlakte * +neighbourhood.properties[indicator.classes[kl]]
      }
    });
  });

  // Nu delen we elke som door het totalSurfaceArea om tot percentages te komen
  totalSumPerClass.forEach(kl => {
    kl.som = (kl.som/totalSurfaceArea)
    if(indicator.title === t('Gevoelstemperatuur')){kl.som *= 100}
  })

  // we stoppen het resultaat per klasse in een dictionary
  let result = {'group':regio}
  Object.keys(indicator.classes).forEach(_class => {
    result[_class] = totalSumPerClass.filter(kl => kl.className === _class)[0].som
  });  

  return result
}

export function calcPercentagesForEveryClassSingleIndicator(indicator, data, regio){
  let totalAmount = 0
  let classesTotal = []
  for(let i=0;i<Object.keys(indicator.classes).length;i++){
    classesTotal.push({className: Object.keys(indicator.classes)[i], waarde:0})
  }
  data.features.forEach(neighbourhoodOrMunicipality => {
    classesTotal.filter(kl => kl.className === getClassByIndicatorValue(indicator, neighbourhoodOrMunicipality.properties[indicator.attribute]))[0].waarde += 1
    totalAmount += 1
  });

  classesTotal.forEach(kl => {
    kl.waarde = (kl.waarde/totalAmount) * 100
  })

  let result = {'group':regio}
  Object.keys(indicator.classes).forEach(klasse => {
    result[klasse] = classesTotal.filter(kl => kl.className === klasse)[0].waarde
  });
  
  return result
}