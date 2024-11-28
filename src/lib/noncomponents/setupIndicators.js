
export function setupIndicators(data, eff, geb, kwe){

  const metadata = (data.lang === 'en')
    ? data.metadata_english
    : data.metadata

  let indicatorsLijst = []

  // let indicatorsOpCategorie = [...metadata.filter(d => d.Categorie === 'Gebiedskenmerken'), ...metadata.filter(d => d.Categorie === 'Effecten'), ...metadata.filter(d => d.Categorie === 'Kwetsbaarheid')]
  indicatorsLijst = addIndicatorCategorie(indicatorsLijst, metadata.filter(d => d.Categorie === eff))
  indicatorsLijst = addIndicatorCategorie(indicatorsLijst, metadata.filter(d => d.Categorie === geb))
  indicatorsLijst = addIndicatorCategorie(indicatorsLijst, metadata.filter(d => d.Categorie === kwe))

  console.log('indicatorsLijst', indicatorsLijst)

  return indicatorsLijst
}

function addIndicatorCategorie(indicatorsLijst, indicators){
  // dit is voor de kopjes in de filter dropdown
  indicatorsLijst.push({titel:{'label':indicators[0].Categorie, 'disabled':true}})

  indicators.forEach(indicator => {
    let klassen = {}
    if(indicator['kwantitatief / categoraal / multiline'] !== 'categoraal'){
      indicator.Domein.split(',').forEach((d,i) => {
        klassen[d] = indicator.Indicatornaamtabel.split(',')[i]
      });
    }else{
      indicator.Domein.split(',').forEach((d,i) => {
        klassen[d] = indicator.klassenthresholds.split(',')[i]
      });
    }

    
    indicatorsLijst.push({
      titel:indicator.Titel, 
      attribute:indicator.Indicatornaamtabel.split(',')[0], 
      subtitel:indicator.Subtitel, 
      plottitel:indicator['Plottitel (enkel bij kwantitatief)'],
      categorie:indicator.Categorie, 
      color:{
        domain:indicator.Domein.split(','), 
        range:indicator.Kleur.split(',')
      }, 
      klassen:klassen,
      numerical:(indicator['kwantitatief / categoraal / multiline'] === 'Kwantitatief') ? true : false, 
      link:indicator['Link kaartverhaal'],
      aggregatedIndicator:(indicator['kwantitatief / categoraal / multiline'] === 'Multiline') ? true : false,
      bron:indicator.Bron,
      omschrijving:indicator['Tekst vraagteken'],
    })
  })
  return indicatorsLijst
}