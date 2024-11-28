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
  // indicatorenLijst = addIndicatorCategorie(indicatorenLijst, metadata.filter(d => d.Categorie === eff))
  indicatorenLijst2023 = addIndicatorCategorie(indicatorenLijst2023, metadata.filter(d => d.Categorie === geb))
  indicatorenLijst2019 = addIndicatorCategorie(indicatorenLijst2019, metadata_2019.filter(d => d.Categorie === geb))
  // indicatorenLijst = addIndicatorCategorie(indicatorenLijst, metadata.filter(d => d.Categorie === kwe))

  alleIndicatoren2023.set(indicatorenLijst2023)
  alleIndicatoren2019.set(indicatorenLijst2019)
  let jaarSelectiesTemp = {}
  indicatorenLijst2019.forEach(indicator => {
    if(typeof indicator.titel === 'string'){
      jaarSelectiesTemp[indicator.titel] = '2023'
    }
  });
  jaarSelecties.set(jaarSelectiesTemp)

  return indicatorenLijst2023;
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
        console.log('indnata',indicator.Indicatornaamtabel.split(','))
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