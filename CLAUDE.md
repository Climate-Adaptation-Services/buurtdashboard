# Buurtdashboard SvelteKit App

## ⚠️ VERPLICHT BIJ ELKE RESPONSE

**STOP. Check deze 3 punten voordat je antwoordt:**

1. **NIET INSTEMMEN** - Zeg nooit "je hebt gelijk", "goed punt", etc. Check eerst of de aanname klopt.
2. **ALTERNATIEF** - Noem minimaal 1 andere aanpak, ook als je denkt dat je oplossing goed is.
3. **ONZEKERHEID** - Label wat je niet zeker weet. "Ik denk..." of "Aanname:" gebruiken.

**Bij twijfel**: Vraag of onderzoek eerst. Niet raden en doen alsof je het zeker weet.

---

A SvelteKit-based neighborhood dashboard application with interactive maps, charts, and indicators. Features **progressive loading** for optimal perceived performance.

📖 **For detailed documentation, see [.claude/project.md](.claude/project.md)**

## Quick Start

```bash
npm install          # Install dependencies
npm run dev          # Start development server (http://localhost:5173)
```

## Development Commands

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run check` - Run Svelte type checking
- `npm run precalculate-nederland` - Regenerate Nederland aggregates (after data updates)
- `node scripts/split-csv-per-gemeente.js` - Split de landelijke CSV per gemeente
- `node scripts/simplify-buurt-topojson.js` - Vereenvoudig de buurtgeometrie offline

## Testing

```bash
npx playwright test           # Run all tests
npx playwright test --ui      # Interactive UI mode
```

Tests located in `/tests/`

## Data Management

### Current Dataset
- **Version**: `20260922` (September 2026)
- **CSV**: `Buurt2024BuurtdashboardDataset20260922.csv.gz`
- **Per gemeente**: `csvdata/per-gemeente-20260922/<gemeentecode>.csv.gz` (342 bestanden)
  - Dit is wat de app daadwerkelijk laadt; de landelijke CSV is alleen nog bron
  - Zie "Data laadt per gemeente" hieronder
- **Config Portal**: Single source of truth for data URLs and indicator configs
  - **Live**: https://buurtdashboard-config-portal.vercel.app
  - **Source**: `../buurtdashboard-config-portal/` (sibling folder)
  - **Dev mode**: Use `VITE_CONFIG_MODE=dev npm run dev` to test unpublished changes

### Updating Data
1. Upload new data files to S3
2. Update URLs in **Config Portal** (https://buurtdashboard-config-portal.vercel.app)
   - CSV Data URL in `dashboard_configs` table
   - Data Download URL
3. Update indicator configs if column names changed (in `indicators` table)
4. Update `DATASET_VERSION` in `src/lib/datasets.js`
5. **Split de CSV per gemeente**: `VITE_CONFIG_MODE=dev node scripts/split-csv-per-gemeente.js`
   - Schrijft naar `generated/csv-per-gemeente/` (gitignored)
   - Upload die map naar `csvdata/per-gemeente-<versie>/` en werk
     `PER_MUNICIPALITY_CSV_BASE` in `src/lib/datasets.js` bij
   - **Zonder deze stap laadt het dashboard geen enkele waarde**
6. Run `VITE_CONFIG_MODE=dev npm run precalculate-nederland`
7. Test with `VITE_CONFIG_MODE=dev npm run dev`
8. Publish to production in Config Portal
9. Commit and deploy

Bij een nieuwe buurt-GeoJSON hoort ook: `node scripts/simplify-buurt-topojson.js`,
resultaat uploaden en `BUURT_GEOJSON_URL` bijwerken. De client vereenvoudigt niet
meer zelf - zie "Data laadt per gemeente".

Note: The precalculate script fetches both CSV URL and indicator config from Config Portal (single source of truth).

### Data laadt per gemeente (sinds 20260922)

De app laadde alle 14.574 buurten x 257 kolommen in een keer: ruim 220 MB geheugen,
waardoor iOS Safari het tabblad afschoot. Nu:

- **Bij opstarten**: alleen de buurtgeometrie (`Buurt2024_presimplified.json.gz`,
  2,4 MB). Die draagt zelf `buurtcode2024`, `buurtnaam`, `gemeentecode` en
  `gemeentenaam`, dus de gemeentefilter werkt zonder CSV.
- **Bij gemeenteselectie**: `src/lib/services/loadMunicipalityData.js` haalt dat ene
  gemeentebestand op (gemiddeld 40 KB) en voegt de waarden toe aan de features van
  die gemeente. Al geladen gemeenten worden overgeslagen.
- **Nederland-brede cijfers** komen uit `static/nederland-aggregates.json`, niet uit
  de ruwe data. Dat bestand bevat ook `ahnOptions`: per indicator welke AHN-versies
  landelijk data hebben en welke jaren daarin voorkomen (gebruikt door `YearSwitch`
  en `GlobalYearSwitch`).
- **De geometrie wordt niet meer in de browser vereenvoudigd.** Dat gebeurde met
  `presimplify()` + `simplify(0.000001)` bij elke lading en kostte een piek van
  237 MB. Nu offline via `scripts/simplify-buurt-topojson.js`.

Resultaat: van ~264 MB naar ~31 MB, download van 17,6 naar 2,9 MB.

**Let op bij wijzigingen**: code die `$allNeighbourhoodsJSONData` gebruikt voor
landelijke cijfers werkt niet meer - buiten de gekozen gemeente hebben features geen
indicatorwaarden. Gebruik `nederlandAggregates`.

### Internationalization
- Dutch config is single source of truth
- English translations applied client-side from `src/lib/i18n/indicator-translations.json`
- Components use `dutchTitle` for store keys (language-independent)

## Key Architecture

### Data Flow
1. Server loads config + CSV
2. Client renders UI with loading states
3. GeoJSON loads in background
4. Progressive enhancement as data arrives

### Key Files
- `src/lib/datasets.js` - All data URLs and version
- `src/lib/stores.js` - Application state
- `src/lib/components/Map.svelte` - Leaflet + D3 map
- `src/lib/services/prepareJSONData.js` - Data processing (geometrie; geen CSV meer)
- `src/lib/services/loadMunicipalityData.js` - Haalt buurtdata per gemeente op
- `src/lib/utils/createIndicatorColorScale.js` - Gedeelde kleurschaal (tegel + modal)
- `src/lib/utils/interactionScope.js` - Beperkt DOM-lookups tot de kaartmodal
- `src/lib/components/MapModal.svelte` - Uitvergrote kaart naast de grafiek
- `src/lib/i18n/indicator-translations.json` - English translations
- `scripts/precalculate-nederland.js` - Nederland aggregates + ahnOptions
- `generated/` - Uitvoer van de scripts, gitignored; hoort in de bucket, niet in static/

### Performance Features
- Data per gemeente in plaats van landelijk (geheugen: ~264 MB -> ~31 MB)
- Geometrie offline vereenvoudigd, niet in de browser
- Viewport virtualization for large municipalities
- Precalculated Nederland aggregates (13,000+ neighborhoods)
- Per-indicator reactive stores
- IndexedDB caching

## Dependencies

- **Framework**: SvelteKit with adapter-vercel
- **Maps**: Leaflet.js
- **Visualizations**: D3.js
- **Testing**: Playwright
- **Data Processing**: fflate, d3-dsv

## Deployment

Configured for **Vercel** deployment with `@sveltejs/adapter-vercel`.

## Troubleshooting

### Data Not Showing
- Check CSV column names match config `indicator_naam_tabel` field in Supabase
- **Scheidingsteken moet `;` zijn en het decimaalteken een punt.** De app
  normaliseert geen komma's: `parseFloat("39,41")` wordt 39 en `+"39,41"` wordt NaN.
  Een komma-CSV laadt zonder foutmelding en toont stilletjes verkeerde waarden.
- Is er een nieuwe CSV? Draai ook `scripts/split-csv-per-gemeente.js` - zonder die
  splitsing vindt de app geen waarden
- Check browser console for errors
- AHN column naming: old-style uses no underscore (`PET29tm34pAHN4`), new-style uses underscore (`BKBgraad_Tot_percLand_AHN3`)
- Percentage values: 0-1 decimals are auto-converted to 0-100 percentages (only for PET* and perc* columns)
- Invalid/missing data values: -9999, -9995, -9991 hebben een eigen melding in beeld;
  -99997 (CBS-onderdrukking) telt als gewoon "geen data". Zie `NO_DATA_CODES` en
  `GENERIC_NO_DATA_CODES` in `src/lib/utils/valueRetrieval.js` - zet een code alleen
  in de eerste als er een vertaalsleutel voor bestaat, anders verschijnt de sleutel
  zelf in beeld

### Config Portal Database
- **Dev table**: `indicators` (for testing unpublished changes)
- **Published table**: `indicators_published` (production)
- Key columns:
  - `indicator_naam_tabel` - CSV column name(s), comma-separated for aggregated indicators
  - `domein` - Class labels for aggregated indicators
  - `ahn_version` - Available AHN versions (e.g., "AHN3,AHN5")

### Map Issues
- Verify GeoJSON loaded in stores
- Ensure map container has dimensions
- **Zwarte buurten** = geen geldige waarde. Bij een gemeentewissel is dat kort normaal
  terwijl de data binnenkomt; `isLoadingMunicipalityData` toont zolang een spinner
- **Kaartmodal**: klassenamen zijn afgeleid van `indicator.title`, dus met de modal open
  staat dezelfde indicator twee keer in de DOM. Gebruik `scopedSelect` uit
  `interactionScope.js` voor DOM-lookups, anders landen tooltips op de tegel erachter

For more details, see [.claude/project.md](.claude/project.md).
