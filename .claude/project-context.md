# sveltekitapp - Project Context

## Project Overzicht

Het Buurtdashboard is een interactieve kaartvisualisatie-applicatie voor het tonen van klimaatadaptatie-indicatoren per buurt/wijk in Nederland. Gebruikers kunnen gemeentes selecteren en verschillende indicatoren bekijken via thematische kaarten en grafieken.

**Doel**: Inzicht geven in klimaatadaptatie-data per buurt voor beleidsmakers, gemeenten en burgers.

**Gerelateerd Project**: `../buurtdashboard-config-portal` - Config portal voor beheer van indicator configuraties

## Tech Stack

- **Framework**: SvelteKit 2.x met Svelte 5
- **Runtime**: Node.js / Browser
- **Package Manager**: npm
- **Kaarten**: Mapbox GL JS
- **Grafieken**: D3.js
- **Deployment**: Vercel

## Architectuur

### Data Flow

1. **Config laden**: Haalt indicator configuraties op van config portal (CSV API)
2. **Geodata laden**: GeoJSON van buurten en gemeentes van AWS S3
3. **CSV data laden**: Indicator waarden per buurt van AWS S3 (gzip compressed)
4. **Visualisatie**: Kaart kleuring + grafieken op basis van geselecteerde indicator

### Config Portal Integratie

De sveltekitapp haalt indicator configuraties van de Vercel-hosted config portal:

**URL**: `https://buurtdashboard-config-portal.vercel.app/api/config/[slug]/csv?mode=[dev|published]`

**Environment variabele** (in `.env`):
```
PUBLIC_CONFIG_MODE=dev      # of 'published' voor productie
```

De config portal URL is hardcoded in `src/lib/datasets.js` - altijd Vercel production.

### Indicator Types

De CSV kolom `kwantitatief / categoraal / geaggregeerd` bepaalt het type:

| Type | Waarde in CSV | Grafiek | Data structuur |
|------|---------------|---------|----------------|
| Kwantitatief | `kwantitatief` | Beeswarm plot | Enkele kolom met numerieke waarde |
| Categoraal | `categoraal` | Bar chart | Enkele kolom met categorie code |
| Geaggregeerd | `geaggregeerd` | Stacked bar chart | Meerdere kolommen (bijv. PET temperatuurbanden) |

De database en CSV gebruiken beide de Nederlandse termen.

### Key Files

#### Data & Config
- `src/lib/datasets.js` - URLs voor alle data bronnen en config portal
- `src/lib/services/setupIndicators.js` - Parsen van indicator CSV configuratie
- `src/lib/stores.js` - Svelte stores voor app state

#### Indicator Berekeningen
- `src/lib/utils/calcPercentagesForEveryClass.js` - Aggregatie berekeningen voor bar charts
  - `calcPercentagesForEveryClassMultiIndicator()` - Voor geaggregeerde indicatoren
  - `calcPercentagesForEveryClassSingleIndicator()` - Voor categorale indicatoren
- `src/lib/utils/getClassByIndicatorValue.js` - Bepaalt klasse op basis van waarde
- `src/lib/utils/getIndicatorAttribute.js` - Bouwt kolomnaam met AHN/jaar suffix
- `src/lib/utils/valueRetrieval.js` - Hulpfuncties voor waarde ophalen en validatie

#### Visualisatie Components
- `src/lib/components/IndicatorCategorical.svelte` - Container voor bar charts (categoraal + geaggregeerd)
- `src/lib/components/BarPlot.svelte` - Bar chart visualisatie met D3.js
- `src/lib/components/BarPlotLegend.svelte` - Legenda voor bar charts
- `src/lib/components/IndicatorNumerical.svelte` - Beeswarm plot voor kwantitatieve data
- `src/lib/components/Map.svelte` - Mapbox GL kaart component
- `src/lib/components/Sidebar.svelte` - Zijbalk met indicator selectie en grafieken

### AHN Versie Naamgeving

Kolom namen in de CSV data volgen dit patroon:

| Type | Patroon | Voorbeeld |
|------|---------|-----------|
| Met AHN versie | `{base}{AHNx}` | `PET29tm34pAHN4` |
| Met jaar | `{base}_{jaar}` | `indicator_2020` |
| Met BEB variant | `{base}{AHNx}_{variant}` | `BKBAHN3_BK` |

**Let op**: Sommige gemeentes (bijv. Dordrecht) gebruiken underscore voor AHN (`BKB_AHN3`), de code heeft fallbacks hiervoor in `calcPercentagesForEveryClass.js` en `getIndicatorAttribute.js`.

## Development

### Setup
```bash
npm install
```

### Environment Variables

Maak `.env` bestand:
```
PUBLIC_CONFIG_MODE=dev
```

### Starten
```bash
npm run dev        # Start development server
npm run build      # Build voor productie
npm run preview    # Preview productie build
```

## Belangrijke Patronen

### Indicator Object Structuur

Na parsing door `setupIndicators.js`:
```javascript
{
  title: "Indicator naam",
  attribute: "kolomnaam",
  subtitle: "...",
  category: "Effecten",
  color: { domain: [...], range: [...] },
  classes: { "No data": "-10", "Klasse1": "kolomnaam1", ... },
  numerical: false,
  aggregatedIndicator: true,  // Bepaalt welke calc functie wordt gebruikt
  AHNversie: "AHN4",
  variants: "BK, M2"
}
```

### Multi-column Geaggregeerde Indicatoren

Voor indicatoren zoals "Gevoelstemperatuur" met meerdere temperatuurbanden:
- Elke klasse heeft een eigen kolom in de CSV data
- `classes` object mapt klassenaam → kolomnaam
- `calcPercentagesForEveryClassMultiIndicator()` berekent percentages per klasse
- Percentage per klasse wordt gestapeld in bar chart

### Categorale Indicatoren

Voor indicatoren met een enkele waarde per buurt:
- Enkele kolom met categorie code (bijv. 1, 2, 3)
- `getClassByIndicatorValue()` bepaalt de klasse op basis van thresholds
- `calcPercentagesForEveryClassSingleIndicator()` telt buurten per klasse

### Waarde Validatie

Ongeldige waarden worden gefilterd:
- `-9999` wordt als "geen data" behandeld
- `isValidValue()` in `valueRetrieval.js` checkt op geldige waarden
- "No data" klasse wordt automatisch toegevoegd aan elke indicator

## Known Issues

- AHN underscore naamgeving verschilt per gemeente (fallback in code)
- Vercel API cache kan even duren na config wijzigingen (~1 min)
- Invalid values (-9999) worden gefilterd maar kunnen bij oude data voorkomen

## Configuratie

### Data URLs

Geconfigureerd in `src/lib/datasets.js`:
- GeoJSON buurten: AWS S3
- Gemeente grenzen: AWS S3
- CSV indicator data: AWS S3 (gzip)
- Indicator config: Config Portal API

### Dashboard Varianten

De applicatie ondersteunt meerdere dashboard configuraties:
- `default-nl` - Standaard KEA buurtdashboard
- `dordrecht` - Dordrecht RMK specifieke configuratie

Elke variant heeft eigen:
- Indicator configuratie (via config portal slug)
- CSV data URL
- GeoJSON data (optioneel)