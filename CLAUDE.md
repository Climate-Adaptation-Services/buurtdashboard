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

## Testing

```bash
npx playwright test           # Run all tests
npx playwright test --ui      # Interactive UI mode
```

Tests located in `/tests/`

## Data Management

### Current Dataset
- **Version**: `20260204` (February 2026)
- **CSV**: `Buurt2024BuurtdashboardDataset20260204RMK.csv.gz`
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
5. Run `VITE_CONFIG_MODE=dev npm run precalculate-nederland`
6. Test with `VITE_CONFIG_MODE=dev npm run dev`
7. Publish to production in Config Portal
8. Commit and deploy

Note: The precalculate script fetches both CSV URL and indicator config from Config Portal (single source of truth).

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
- `src/lib/services/prepareJSONData.js` - Data processing
- `src/lib/i18n/indicator-translations.json` - English translations
- `scripts/precalculate-nederland.js` - Nederland aggregates

### Performance Features
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
- Verify semicolon-separated format (decimal format can be dot or comma)
- Check browser console for errors
- AHN column naming: old-style uses no underscore (`PET29tm34pAHN4`), new-style uses underscore (`BKBgraad_Tot_percLand_AHN3`)
- Percentage values: 0-1 decimals are auto-converted to 0-100 percentages (only for PET* and perc* columns)
- Invalid/missing data values: -9999, -9995, -9991 are treated as "no data"

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

For more details, see [.claude/project.md](.claude/project.md).
