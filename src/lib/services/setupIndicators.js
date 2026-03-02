import { alleIndicatoren } from "$lib/stores"
import indicatorTranslations from "$lib/i18n/indicator-translations.json"

// Category translations for English
const categoryTranslations = {
  'Effecten': 'Effects',
  'Gebiedskenmerken': 'Area characteristics',
  'Kwetsbaarheid': 'Vulnerability'
}

export function setupIndicators(data, eff, geb, kwe) {
  // Always use Dutch config as the source of truth
  const indicatorsConfig = data.indicatorsConfig
  const isEnglish = data.lang === 'en'

  let indicatorsList = [];
  [eff, geb, kwe].forEach(category => {
    if (indicatorsConfig.filter(d => d.Categorie === category).length > 0) {
      indicatorsList = addIndicatorCategory(indicatorsList, indicatorsConfig.filter(d => d.Categorie === category), isEnglish)
    }
  });

  alleIndicatoren.set(indicatorsList)

  return indicatorsList;
}

function addIndicatorCategory(indicatorsList, indicators, isEnglish = false) {
  // dit is voor de kopjes in de filter dropdown
  const categoryLabel = isEnglish
    ? (categoryTranslations[indicators[0].Categorie] || indicators[0].Categorie)
    : indicators[0].Categorie
  indicatorsList.push({ title: { 'label': categoryLabel, 'disabled': true } })

  indicators.forEach(indicator => {
    // Skip indicators with empty title
    if (!indicator.Titel || indicator.Titel === '') return;

    // Get English translation if available
    const translation = isEnglish ? indicatorTranslations.translations[indicator.Titel] : null

    // Get domain labels and table items
    const dutchDomein = indicator.Domein ? indicator.Domein.split(',').map(d => d.trim()) : []
    const englishDomein = translation?.domain ? translation.domain.split(',').map(d => d.trim()) : null
    const domeinLabels = (isEnglish && englishDomein) ? englishDomein : dutchDomein
    const tabelItems = indicator.Indicatornaamtabel ? indicator.Indicatornaamtabel.split(',').map(item => item.trim()) : []

    // Check if any tabel item is '-10' (remainder class for filling to 100%)
    // Only indicators with '-10' will have their remainder filled to 100%
    const hasRemainderInConfig = tabelItems.includes('-10')

    let classes = {}
    // Use domain labels directly from config
    let indicatorDomein = [...domeinLabels]
    let indicatorColors = (indicator['kwantitatief / categoraal / geaggregeerd'] !== 'kwantitatief')
      ? (indicator.Kleur ? indicator.Kleur.split(',').map(c => c.trim()) : [])
      : (indicator.Kleur ? indicator.Kleur.split(',').map(c => c.trim()) : [])

    if (indicator['kwantitatief / categoraal / geaggregeerd'] !== 'categoraal') {
      if (indicator.Indicatornaamtabel) {
        // Map domain labels to tabel items directly
        indicatorDomein.forEach((d, i) => {
          if (tabelItems[i]) {
            classes[d] = tabelItems[i]
          }
        });
      }
    } else {
      if (indicator.klassenthresholds) {
        const thresholds = indicator.klassenthresholds.split(',').map(item => item.trim())
        indicatorDomein.forEach((d, i) => {
          if (thresholds[i]) {
            classes[d] = thresholds[i]
          }
        });
      }
    }

    // Apply translations for English, fallback to Dutch
    const title = (isEnglish && translation?.title) ? translation.title : indicator.Titel
    const subtitle = (isEnglish && translation?.subtitle) ? translation.subtitle : indicator.Subtitel
    const description = (isEnglish && translation?.description) ? translation.description : indicator['Tekst vraagteken']
    const plottitle = (isEnglish && translation?.plottitle) ? translation.plottitle : indicator['Plottitel (enkel bij kwantitatief)']
    const category = isEnglish
      ? (categoryTranslations[indicator.Categorie] || indicator.Categorie)
      : indicator.Categorie

    indicatorsList.push({
      title: title,
      // Store Dutch title for lookup in nederland-aggregates.json (which uses Dutch keys)
      dutchTitle: indicator.Titel,
      attribute: indicator.Indicatornaamtabel ? indicator.Indicatornaamtabel.split(',')[0].trim() : '',
      subtitle: subtitle,
      plottitle: plottitle,
      category: category,
      // Store Dutch category for icon path (icons are named Effecten.png, etc.)
      dutchCategory: indicator.Categorie,
      color: {
        domain: indicatorDomein,
        range: indicatorColors
      },
      classes: classes,
      numerical: (indicator['kwantitatief / categoraal / geaggregeerd'] === 'kwantitatief') ? true : false,
      link: indicator['Link kaartverhaal'],
      aggregatedIndicator: (indicator['kwantitatief / categoraal / geaggregeerd'] === 'geaggregeerd') ? true : false,
      source: indicator.Bron,
      description: description,
      AHNversie: indicator['AHNversie'],
      surfaceArea: indicator['Oppervlakte'],
      variants: indicator.Varianten
    })

  })
  return indicatorsList
}
