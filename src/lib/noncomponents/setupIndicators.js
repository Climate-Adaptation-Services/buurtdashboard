import { alleIndicatoren, jaarSelecties } from "$lib/stores"
import { get } from "svelte/store"
export function setupIndicators(data, eff, geb, kwe) {

  const metadata = (data.lang === 'en')
    ? data.metadata_english
    : data.metadata
  // const metadata_2019 = (data.lang === 'en')
  //   ? data.metadata_dordrecht_2019
  //   : data.metadata_dordrecht_2019


  let indicatorsList = []
  indicatorsList = addIndicatorCategory(indicatorsList, metadata.filter(d => d.Categorie === eff))
  indicatorsList = addIndicatorCategory(indicatorsList, metadata.filter(d => d.Categorie === geb))
  indicatorsList = addIndicatorCategory(indicatorsList, metadata.filter(d => d.Categorie === kwe))

  alleIndicatoren.set(indicatorsList)

  console.log('indicatorenLijst', indicatorsList)

  return indicatorsList;
}

function addIndicatorCategory(indicatorsList, indicators) {
  // dit is voor de kopjes in de filter dropdown
  indicatorsList.push({ title: { 'label': indicators[0].Categorie, 'disabled': true } })

  indicators.forEach(indicator => {
    // if(indicator.Titel === 'Perceived temperature'){return}

    let classes = { 'No data': '-10' }
    // add no data class
    const indicatorDomein = ['No data', ...indicator.Domein.split(',')]
    const noDataColor = '#333333'
    const indicatorColors = (indicator['kwantitatief / categoraal / multiline'] !== 'Kwantitatief')
      ? [noDataColor, ...indicator.Kleur.split(',')]
      : indicator.Kleur.split(',')

    if (indicator['kwantitatief / categoraal / multiline'] !== 'categoraal') {
      indicatorDomein.slice(1).forEach((d, i) => {
        classes[d] = indicator.Indicatornaamtabel.split(',')[i] + get(jaarSelecties)[indicator.Titel]
      });
    } else {
      indicatorDomein.slice(1).forEach((d, i) => {
        classes[d] = indicator.klassenthresholds.split(',')[i] + get(jaarSelecties)[indicator.Titel]
      });
    }

    indicatorsList.push({
      title: indicator.Titel,
      attribute: indicator.Indicatornaamtabel.split(',')[0] + get(jaarSelecties)[indicator.Titel],
      subtitle: indicator.Subtitel,
      plottitle: indicator['Plottitel (enkel bij kwantitatief)'],
      category: indicator.Categorie,
      color: {
        domain: indicatorDomein,
        range: indicatorColors
      },
      classes: classes,
      numerical: (indicator['kwantitatief / categoraal / multiline'] === 'Kwantitatief') ? true : false,
      link: indicator['Link kaartverhaal'],
      aggregatedIndicator: (indicator['kwantitatief / categoraal / multiline'] === 'Multiline') ? true : false,
      source: indicator.Bron,
      description: indicator['Tekst vraagteken'],
      AHNversie: indicator['AHNversie'],
    })

  })
  return indicatorsList
}