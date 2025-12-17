# sveltekitapp - Project Context

## Project Overview

Het Buurtdashboard is een interactieve kaartvisualisatie-applicatie voor het tonen van klimaatadaptatie-indicatoren per buurt/wijk in Nederland. Gebruikers kunnen gemeentes selecteren en verschillende indicatoren bekijken via thematische kaarten en grafieken.

**Purpose**: Inzicht geven in klimaatadaptatie-data per buurt voor beleidsmakers, gemeenten en burgers.

**Related Project**: `../buurtdashboard-config-portal` - Config portal voor beheer van indicator configuraties

## Tech Stack

- **Framework**: SvelteKit 2.x met Svelte 5
- **Runtime**: Node.js / Browser
- **Package Manager**: npm
- **Maps**: Mapbox GL JS
- **Charts**: D3.js
- **Deployment**: Vercel

## Architecture

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

#### Components
- `src/lib/components/IndicatorCategorical.svelte` - Container voor bar charts
- `src/lib/components/BarPlot.svelte` - Bar chart visualisatie
- `src/lib/components/IndicatorNumerical.svelte` - Beeswarm plot

### AHN Versie Naamgeving

Kolom namen in de CSV data volgen dit patroon:

| Type | Patroon | Voorbeeld |
|------|---------|-----------|
| Met AHN versie | `{base}{AHNx}` | `PET29tm34pAHN4` |
| Met jaar | `{base}_{jaar}` | `indicator_2020` |
| Met BEB variant | `{base}{AHNx}_{variant}` | `BKBAHN3_BK` |

**Let op**: Sommige gemeentes (bijv. Dordrecht) gebruiken underscore voor AHN (`BKB_AHN3`), de code heeft fallbacks hiervoor.

## Development

### Setup
```bash
npm install
```

### Environment Variables

Create `.env` file:
```
PUBLIC_CONFIG_MODE=dev
```

### Running
```bash
npm run dev        # Start development server
npm run build      # Build for production
npm run preview    # Preview production build
```

## Important Patterns

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
- Percentage per klasse wordt berekend en gestapeld in bar chart

## Known Issues

- AHN underscore naamgeving verschilt per gemeente (fallback in code)
- Vercel API cache kan even duren na config wijzigingen (~1 min)
- Invalid values (-9999) worden gefilterd maar kunnen bij oude data voorkomen

## Configuration

### Data URLs

Geconfigureerd in `src/lib/datasets.js`:
- GeoJSON buurten: AWS S3
- Gemeente grenzen: AWS S3
- CSV indicator data: AWS S3 (gzip)
- Indicator config: Config Portal API