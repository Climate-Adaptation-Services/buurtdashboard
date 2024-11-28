import { getClassByIndicatorValue } from "./getClassByIndicatorValue";
import { t } from "$lib/i18n/translate";

export function berekenPercentagesVoorElkeKlasseMultiIndicator(indicator, data, regio){
  let totaalOppervlakte = 0
  let totaleSomPerKlasse = []

  // object om totale som van elke klasse in op te tellen
  for(let i=0;i<Object.keys(indicator.klassen).length;i++){
    totaleSomPerKlasse.push({
      klasseNaam: Object.keys(indicator.klassen)[i], 
      som:0
    })
  }

  // voor elke neighbourhood gaan we de waardes van elke klasse bij de som van die klasse toevoegen
  data.features.forEach(neighbourhood => {
    let neighbourhoodOppervlakte = (indicator.titel === 'Functionele gebieden')
      ? neighbourhood.properties['neighbourhood_opp_incl_agrarisch']
      : neighbourhood.properties['neighbourhood_opp_zonderagr']

    totaalOppervlakte += neighbourhoodOppervlakte

    if(indicator.titel === t('Gevoelstemperatuur')){totaalOppervlakte -= neighbourhoodOppervlakte * neighbourhood.properties['NDPETperc']}
    
    // voor deze neighbourhood tel de waardes van elke klasse bij de totale som op
    Object.keys(indicator.klassen).forEach(kl => {
      // is dit goed zo of moeten we anders met no data (NaN) omgaan
      if(neighbourhood.properties[indicator.klassen[kl]] && !isNaN(parseFloat(neighbourhood.properties[indicator.klassen[kl]]))){
        // pak de klasse erbij in totaleSomPerKlasse
        const tempKlasse = totaleSomPerKlasse.filter(kl2 => kl2.klasseNaam === kl)[0]
        // we wegen ook voor het oppervlakte met neighbourhoodOppervlakte
        tempKlasse.som += neighbourhoodOppervlakte * +neighbourhood.properties[indicator.klassen[kl]]
      }
    });
  });

  // Nu delen we elke som door het totaalOppervlakte om tot percentages te komen
  totaleSomPerKlasse.forEach(kl => {
    kl.som = (kl.som/totaalOppervlakte)
    if(indicator.titel === t('Gevoelstemperatuur')){kl.som *= 100}
  })

  // we stoppen het resultaat per klasse in een dictionary
  let result = {'group':regio}
  Object.keys(indicator.klassen).forEach(klasse => {
    result[klasse] = totaleSomPerKlasse.filter(kl => kl.klasseNaam === klasse)[0].som
  });  

  return result
}

export function berekenPercentagesVoorElkeKlasseSingleIndicator(indicator, data, regio){
  let totalAmount = 0
  let klassenTotal = []
  for(let i=0;i<Object.keys(indicator.klassen).length;i++){
    klassenTotal.push({klasseNaam: Object.keys(indicator.klassen)[i], waarde:0})
  }
  data.features.forEach(neighbourhoodOfGemeente => {
    klassenTotal.filter(kl => kl.klasseNaam === getClassByIndicatorValue(indicator, neighbourhoodOfGemeente.properties[indicator.attribute]))[0].waarde += 1
    totalAmount += 1
  });

  klassenTotal.forEach(kl => {
    kl.waarde = (kl.waarde/totalAmount) * 100
  })

  let result = {'group':regio}
  Object.keys(indicator.klassen).forEach(klasse => {
    result[klasse] = klassenTotal.filter(kl => kl.klasseNaam === klasse)[0].waarde
  });
  
  return result
}