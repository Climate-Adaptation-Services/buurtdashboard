
export function setupIndicators(data, eff, geb, kwe){

  const metadata = (data.lang === 'en')
    ? data.metadata_english
    : data.metadata

  let indicatorsList = []

  // let indicatorsOpCategorie = [...metadata.filter(d => d.Categorie === 'Gebiedskenmerken'), ...metadata.filter(d => d.Categorie === 'Effecten'), ...metadata.filter(d => d.Categorie === 'Kwetsbaarheid')]
  indicatorsList = addIndicatorCategorie(indicatorsList, metadata.filter(d => d.Categorie === eff))
  indicatorsList = addIndicatorCategorie(indicatorsList, metadata.filter(d => d.Categorie === geb))
  indicatorsList = addIndicatorCategorie(indicatorsList, metadata.filter(d => d.Categorie === kwe))

  console.log('indicatorsList', indicatorsList)

  return indicatorsList
}

function addIndicatorCategorie(indicatorsList, indicators){
  // dit is voor de kopjes in de filter dropdown
  indicatorsList.push({titel:{'label':indicators[0].Categorie, 'disabled':true}})

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
      titel:indicator.Titel, 
      attribute:indicator.Indicatornaamtabel.split(',')[0], 
      subtitel:indicator.Subtitel, 
      plottitel:indicator['Plottitel (enkel bij kwantitatief)'],
      categorie:indicator.Categorie, 
      color:{
        domain:indicator.Domein.split(','), 
        range:indicator.Kleur.split(',')
      }, 
      classes:classes,
      numerical:(indicator['kwantitatief / categoraal / multiline'] === 'Kwantitatief') ? true : false, 
      link:indicator['Link kaartverhaal'],
      aggregatedIndicator:(indicator['kwantitatief / categoraal / multiline'] === 'Multiline') ? true : false,
      bron:indicator.Bron,
      omschrijving:indicator['Tekst vraagteken'],
    })
  })
  return indicatorsList
}