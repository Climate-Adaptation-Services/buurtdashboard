# Buurtdashboard SvelteKit App

A SvelteKit-based neighborhood dashboard application with interactive maps, charts, and indicators. Features **progressive loading** for optimal perceived performance - UI appears immediately while data loads in the background.

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
- `npm run check:watch` - Run type checking in watch mode

## Testing

```bash
npx playwright test           # Run all tests
npx playwright test --ui      # Interactive UI mode
npx playwright test --debug   # Debug mode
```

- Tests located in `/tests/`
- Screenshots for visual regression in `/tests/screenshots/`

## Recent Improvements (2025-10-20)

### Progressive Loading Implementation

The app now uses **progressive loading** for dramatically improved perceived performance:

- ✅ **UI appears in <100ms** - Side panel, map container, and indicator skeletons show immediately
- ✅ **Background data loading** - GeoJSON loads client-side without blocking page render
- ✅ **Smooth transitions** - Components fill with real data as it becomes available
- ✅ **Loading states** - Skeleton loaders with shimmer effects, spinners, and progress indicators

**Technical changes:**
- `src/routes/+page.js` - Removed blocking GeoJSON fetch
- `src/routes/+page.svelte` - Added client-side data loading in `onMount()`
- `src/lib/components/Map.svelte` - Progressive map rendering with initialization guards
- All components - Added loading state props and skeleton UI

See [.claude/project.md](.claude/project.md) for complete details.

## Project Structure

- **Components**: Chart components (BarPlot, BeeswarmPlot), Map component, Indicators, Control Panel
- **Services**: Data processing, Leaflet map management, URL state management
- **Stores**: Reactive state management with derived stores
- **Utilities**: Helper functions in `src/lib/utils/`
- **Internationalization**: Dutch/English support in `src/lib/i18n/`
- **Static Assets**: Images and global CSS in `/static/`

## Key Features

- **Interactive Maps**: Leaflet + D3.js overlay with zoom/pan, click interactions
- **Data Visualizations**: Beeswarm plots, bar charts, choropleth maps
- **Progressive Loading**: Immediate UI feedback with background data loading
- **Multi-language**: Dutch (default) + English
- **Responsive Design**: Desktop and mobile layouts
- **URL State Management**: Shareable links to specific views
- **IndexedDB Caching**: Faster subsequent loads

## Architecture

**Data Flow:**
1. Server loads lightweight data (metadata + CSV)
2. Client renders UI immediately with loading states
3. Client fetches GeoJSON in background
4. Progressive enhancement as data arrives

**Key Files:**
- `src/routes/+page.svelte` - Main page component
- `src/lib/components/Map.svelte` - Dual-mode map (Leaflet + D3)
- `src/lib/stores.js` - Application state
- `src/lib/services/prepareJSONData.js` - Data processing pipeline
- `src/lib/config.js` - App configuration

## Dependencies

- **Framework**: SvelteKit with adapter-vercel
- **Maps**: Leaflet.js
- **Visualizations**: D3.js
- **Testing**: Playwright
- **Data Processing**: fflate (compression), d3-dsv (CSV parsing)

## Deployment

Configured for **Vercel** deployment with `@sveltejs/adapter-vercel`.

Build output: `.svelte-kit/output/` → `.vercel/output/`

## Troubleshooting

### Slow Initial Load
Progressive loading should make this rare. If it occurs:
- Check GeoJSON file size (<5MB recommended)
- Verify IndexedDB cache is working
- Check Network tab in DevTools

### Map Not Rendering
- Verify GeoJSON data loaded in stores
- Check console for "Set map center and zoom first" error (should be fixed)
- Ensure map container has dimensions

### Data Not Showing
- Check CSV column names match metadata `attribute` field
- Verify semicolon-separated format with Dutch decimal comma
- Check browser console for parsing errors

For more troubleshooting tips, see [.claude/project.md](.claude/project.md).