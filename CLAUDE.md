# Buurtdashboard SvelteKit App

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
- **Version**: `20260107` (January 2026)
- **CSV**: `jan26-Buurtdashboarddata.csv.gz`
- **Config Portal**: Single source of truth for data URLs
  - **Live**: https://buurtdashboard-config-portal.vercel.app
  - **Source**: `../buurtdashboard-config-portal/` (sibling folder)

### Updating Data
1. Upload new data files to S3
2. Update URLs in **Config Portal** (https://buurtdashboard-config-portal.vercel.app)
   - CSV Data URL
   - Data Download URL
3. Publish to production in Config Portal
4. Update `DATASET_VERSION` in `src/lib/datasets.js`
5. Run `npm run precalculate-nederland`
6. Commit and deploy

Note: The app fetches data URLs from the Config Portal JSON API. Fallback URLs in `datasets.js` are only used if the portal is unavailable.

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
- Check CSV column names match config `attribute` field
- Verify semicolon-separated format with Dutch decimal comma
- Check browser console for errors

### Map Issues
- Verify GeoJSON loaded in stores
- Ensure map container has dimensions

For more details, see [.claude/project.md](.claude/project.md).
