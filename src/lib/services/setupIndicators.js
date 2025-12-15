import { alleIndicatoren } from "$lib/stores"
export function setupIndicators(data, eff, geb, kwe) {


  const indicatorsConfig = (data.lang === 'en')
    ? data.indicatorsConfig_english
    : data.indicatorsConfig

  let indicatorsList = [];
  [eff, geb, kwe].forEach(category => {
    if (indicatorsConfig.filter(d => d.Categorie === category).length > 0) {
      indicatorsList = addIndicatorCategory(indicatorsList, indicatorsConfig.filter(d => d.Categorie === category))
    }
  });

  alleIndicatoren.set(indicatorsList)



  return indicatorsList;
}

function addIndicatorCategory(indicatorsList, indicators) {
  // dit is voor de kopjes in de filter dropdown
  indicatorsList.push({ title: { 'label': indicators[0].Categorie, 'disabled': true } })

  indicators.forEach(indicator => {
    // Skip indicators with empty title
    if (!indicator.Titel || indicator.Titel === '') return;

    let classes = { 'No data': '-10' }
    // add no data class - trim whitespace from domain names and colors
    const indicatorDomein = ['No data', ...(indicator.Domein ? indicator.Domein.split(',').map(d => d.trim()) : [])]
    const noDataColor = '#333333'
    const indicatorColors = (indicator['kwantitatief / categoraal / aggregated'] !== 'kwantitatief')
      ? [noDataColor, ...(indicator.Kleur ? indicator.Kleur.split(',').map(c => c.trim()) : [])]
      : (indicator.Kleur ? indicator.Kleur.split(',').map(c => c.trim()) : [])

    if (indicator['kwantitatief / categoraal / aggregated'] !== 'categoraal') {
      indicatorDomein.slice(1).forEach((d, i) => {
        if (indicator.Indicatornaamtabel) {
          // Trim whitespace from column names to handle inconsistent spacing in CSV
          classes[d] = indicator.Indicatornaamtabel.split(',')[i].trim()
        }
      });
    } else {
      indicatorDomein.slice(1).forEach((d, i) => {
        if (indicator.klassenthresholds) {
          // Trim whitespace from thresholds
          classes[d] = indicator.klassenthresholds.split(',')[i].trim()
        }
      });
    }

    indicatorsList.push({
      title: indicator.Titel,
      attribute: indicator.Indicatornaamtabel ? indicator.Indicatornaamtabel.split(',')[0].trim() : '',
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
      aggregatedIndicator: (indicator['kwantitatief / categoraal / aggregated'] === 'geaggregeerd') ? true : false,
      source: indicator.Bron,
      description: indicator['Tekst vraagteken'],
      AHNversie: indicator['AHNversie'],
      surfaceArea: indicator['Oppervlakte'],
      variants: indicator.Varianten
    })

  })
  return indicatorsList
}