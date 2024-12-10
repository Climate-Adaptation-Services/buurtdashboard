import { alleIndicatoren2019, alleIndicatoren2023, jaarSelecties } from "$lib/stores"

export function setupIndicators(data, eff, geb, kwe){

  const metadata = (data.lang === 'en')
    ? data.metadata_dordrecht
    : data.metadata_dordrecht
  const metadata_2019 = (data.lang === 'en')
    ? data.metadata_dordrecht_2019
    : data.metadata_dordrecht_2019

  let indicatorenLijst2023 = []
  let indicatorenLijst2019 = []

  // let indicatorenOpCategorie = [...metadata.filter(d => d.Categorie === 'Gebiedskenmerken'), ...metadata.filter(d => d.Categorie === 'Effecten'), ...metadata.filter(d => d.Categorie === 'Kwetsbaarheid')]
  indicatorenLijst2023 = addIndicatorCategory(indicatorenLijst2023, metadata.filter(d => d.Categorie === eff))
  indicatorenLijst2023 = addIndicatorCategory(indicatorenLijst2023, metadata.filter(d => d.Categorie === geb))
  indicatorenLijst2023 = addIndicatorCategory(indicatorenLijst2023, metadata.filter(d => d.Categorie === kwe))
  indicatorenLijst2019 = addIndicatorCategory(indicatorenLijst2019, metadata_2019.filter(d => d.Categorie === geb))

  alleIndicatoren2023.set(indicatorenLijst2023)
  alleIndicatoren2019.set(indicatorenLijst2019)
  let jaarSelectiesTemp = {}
  indicatorenLijst2019.forEach(indicator => {
    if(typeof indicator.title === 'string'){
      jaarSelectiesTemp[indicator.title] = '2023'
    }
  });
  jaarSelecties.set(jaarSelectiesTemp)

  console.log('indicatorenLijst', indicatorenLijst2019, indicatorenLijst2023)

  return indicatorenLijst2023;
}

function addIndicatorCategory(indicatorsList, indicators){
  // dit is voor de kopjes in de filter dropdown
  indicatorsList.push({title:{'label':indicators[0].Categorie, 'disabled':true}})

  indicators.forEach(indicator => {
    if(indicator.Titel === 'Oppervlakte openbaar / niet openbaar'){return}
    let classes = {}
    if(indicator['kwantitatief / categoraal / aggregated'] !== 'categoraal'){
      indicator.Domein.split(',').forEach((d,i) => {
        classes[d] = indicator.Indicatornaamtabel.split(',')[i]
      });
    }else{
      indicator.Domein.split(',').forEach((d,i) => {
        classes[d] = indicator.klassenthresholds.split(',')[i]
      });
    }
    
    indicatorsList.push({
      title:indicator.Titel, 
      attribute:indicator.Indicatornaamtabel.split(',')[0], 
      subtitle:indicator.Subtitel, 
      plottitle:indicator['Plottitel (enkel bij kwantitatief)'],
      category:indicator.Categorie, 
      color:{
        domain:indicator.Domein.split(','), 
        range:indicator.Kleur.split(',')
      }, 
      classes:classes,
      numerical:(indicator['kwantitatief / categoraal / aggregated'] === 'kwantitatief') ? true : false, 
      link:indicator['Link kaartverhaal'],
      aggregatedIndicator:(indicator['kwantitatief / categoraal / aggregated'] === 'aggregated') ? true : false,
      source:indicator.Bron,
      description:indicator['Tekst vraagteken'],
    })
  })
  return indicatorsList
}