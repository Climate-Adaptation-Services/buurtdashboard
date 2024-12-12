
export function setupIndicators(data, eff, geb, kwe){

  const metadata = (data.lang === 'en')
    ? data.metadata_english
    : data.metadata

  let indicatorsList = []

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
    if(indicator.Titel === 'Gevoelstemperatuur'){return}

    let classes = {'No data':'-10'}
    // add no data class
    const indicatorDomein = ['No data', ...indicator.Domein.split(',')]
    const noDataColor = '#333333'
    const indicatorColors = (indicator['kwantitatief / categoraal / multiline'] !== 'Kwantitatief')
      ? [noDataColor, ...indicator.Kleur.split(',')]
      : indicator.Kleur.split(',')
    
    console.log(indicator.Titel, indicatorColors)

    if(indicator['kwantitatief / categoraal / multiline'] !== 'categoraal'){
      indicatorDomein.slice(1).forEach((d,i) => {
        classes[d] = indicator.Indicatornaamtabel.split(',')[i]
      });
    }else{
      indicatorDomein.slice(1).forEach((d,i) => {
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
        domain:indicatorDomein, 
        range:indicatorColors
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