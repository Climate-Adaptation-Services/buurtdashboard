
export function setupIndicators(data, eff, geb, kwe){

  const metadata = (data.lang === 'en')
    ? data.metadata_english
    : data.metadata

  let indicatorsList = []

  // let indicatorsOpCategory = [...metadata.filter(d => d.Category === 'Gebiedskenmerken'), ...metadata.filter(d => d.Category === 'Effecten'), ...metadata.filter(d => d.Category === 'Kwetsbaarheid')]
  indicatorsList = addIndicatorCategory(indicatorsList, metadata.filter(d => d.Categorie === eff))
  indicatorsList = addIndicatorCategory(indicatorsList, metadata.filter(d => d.Categorie === geb))
  indicatorsList = addIndicatorCategory(indicatorsList, metadata.filter(d => d.Categorie === kwe))

  console.log('indicatorsList', indicatorsList)

  return indicatorsList
}

function addIndicatorCategory(indicatorsList, indicators){
  // dit is voor de kopjes in de filter dropdown
  indicatorsList.push({title:{'label':indicators[0].Categorie, 'disabled':true}})

  indicators.forEach(indicator => {
    let classes = {}
    if(indicator['kwantitatief / categoraal / multiline'] !== 'categoraal'){
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
      numerical:(indicator['kwantitatief / categoraal / multiline'] === 'Kwantitatief') ? true : false, 
      link:indicator['Link kaartverhaal'],
      aggregatedIndicator:(indicator['kwantitatief / categoraal / multiline'] === 'Multiline') ? true : false,
      source:indicator.Bron,
      description:indicator['Tekst vraagteken'],
    })
  })
  return indicatorsList
}