import { alleIndicatoren } from "$lib/stores"
export function setupIndicators(data, eff, geb, kwe) {
  console.log(data.metadata)

  const metadata = (data.lang === 'en')
    ? data.metadata_english
    : data.metadata

  let indicatorsList = [];
  [eff, geb, kwe].forEach(category => {
    if (metadata.filter(d => d.Categorie === category).length > 0) {
      indicatorsList = addIndicatorCategory(indicatorsList, metadata.filter(d => d.Categorie === category))
    }
  });

  alleIndicatoren.set(indicatorsList)

  console.log('indicatorsList', indicatorsList)

  return indicatorsList;
}

function addIndicatorCategory(indicatorsList, indicators) {
  // dit is voor de kopjes in de filter dropdown
  indicatorsList.push({ title: { 'label': indicators[0].Categorie, 'disabled': true } })

  indicators.forEach(indicator => {

    let classes = { 'No data': '-10' }
    // add no data class
    const indicatorDomein = ['No data', ...indicator.Domein.split(',')]
    const noDataColor = '#333333'
    const indicatorColors = (indicator['kwantitatief / categoraal / aggregated'] !== 'kwantitatief')
      ? [noDataColor, ...indicator.Kleur.split(',')]
      : indicator.Kleur.split(',')

    if (indicator['kwantitatief / categoraal / aggregated'] !== 'categoraal') {
      indicatorDomein.slice(1).forEach((d, i) => {
        classes[d] = indicator.Indicatornaamtabel.split(',')[i]
      });
    } else {
      indicatorDomein.slice(1).forEach((d, i) => {
        classes[d] = indicator.klassenthresholds.split(',')[i]
      });
    }

    indicatorsList.push({
      title: indicator.Titel,
      attribute: indicator.Indicatornaamtabel.split(',')[0],
      subtitle: indicator.Subtitel,
      plottitle: indicator['Plottitel (enkel bij kwantitatief)'],
      category: indicator.Categorie,
      color: {
        domain: indicatorDomein,
        range: indicatorColors
      },
      classes: classes,
      numerical: (indicator['kwantitatief / categoraal / aggregated'] === 'kwantitatief') ? true : false,
      link: indicator['Link kaartverhaal'],
      aggregatedIndicator: (indicator['kwantitatief / categoraal / aggregated'] === 'aggregated') ? true : false,
      source: indicator.Bron,
      description: indicator['Tekst vraagteken'],
      AHNversie: indicator['AHNversie'],
      variants: indicator.Varianten
    })

  })
  return indicatorsList
}