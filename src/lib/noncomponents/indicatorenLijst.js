
export function getIndicatorenLijst(metadata, eff, geb, kwe){
  console.log('metadata', metadata, eff, geb, kwe)

  let indicatorenLijst = []

  // let indicatorenOpCategorie = [...metadata.filter(d => d.Categorie === 'Gebiedskenmerken'), ...metadata.filter(d => d.Categorie === 'Effecten'), ...metadata.filter(d => d.Categorie === 'Kwetsbaarheid')]
  indicatorenLijst = addIndicatorCategorie(indicatorenLijst, metadata.filter(d => d.Categorie === eff))
  indicatorenLijst = addIndicatorCategorie(indicatorenLijst, metadata.filter(d => d.Categorie === geb))
  indicatorenLijst = addIndicatorCategorie(indicatorenLijst, metadata.filter(d => d.Categorie === kwe))

  console.log('indicatorenLijst', indicatorenLijst)

  return indicatorenLijst
}

function addIndicatorCategorie(indicatorenLijst, indicatoren){
  // dit is voor de kopjes in de filter dropdown
  indicatorenLijst.push({titel:{'label':indicatoren[0].Categorie, 'disabled':true}})

  indicatoren.forEach(indicator => {
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

    indicatorenLijst.push({
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
      multiline:(indicator['kwantitatief / categoraal / multiline'] === 'Multiline') ? true : false,
      bron:indicator.Bron,
      omschrijving:indicator['Tekst vraagteken'],
    })
  })
  return indicatorenLijst
}