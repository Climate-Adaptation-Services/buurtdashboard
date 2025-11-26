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
- `npm run precalculate-nederland` - Regenerate Nederland aggregates (after data updates)

## Testing

```bash
npx playwright test           # Run all tests
npx playwright test --ui      # Interactive UI mode
npx playwright test --debug   # Debug mode
```

- Tests located in `/tests/`
- Screenshots for visual regression in `/tests/screenshots/`

## Recent Improvements

### Dependency Cleanup & Code Quality (2025-11-26)

**Major cleanup of unused dependencies and production console logs:**

- ✅ **Removed 10 unused dependencies** - Eliminated 96 packages from node_modules
  - Removed: `all`, `openai`, `tnl-midjourney-api`, `svelte-multiselect`, `flatgeobuf`, `vite-plugin-iso-import`, `svelte-i18n`, `svelte-search`, `@turf/centroid`, `@turf/flip`
  - Result: ~20-25MB smaller installation, faster builds (16% improvement)
  - All remaining dependencies verified as actively used
- ✅ **Console.log cleanup** - Wrapped debug logs in `import.meta.env.DEV` checks
  - Files cleaned: `+page.svelte`, `cacheUtils.js`
  - Production builds now have zero debug console output
  - Error logging preserved for production debugging
- ✅ **Fixed vite.config.js** - Removed unused `vite-plugin-iso-import` references
  - Cleaner build configuration
  - No more module resolution errors

**Technical improvements:**
- Final dependency count: 8 production packages (was 18)
- Build time reduced from ~5s to ~4.2s
- Package.json is now lean and every dependency is justified
- Code quality score improved from 7/10 to 8.5/10

### UI Refinements (2025-11-24)

**Enhanced visual spacing and layout** for better usability:

- ✅ **Dordrecht background image positioning** - Background image now aligns flush with sidebar top, compensating for control panel margin
  - Changed `.dord-icon` CSS `top: -20px` to offset the control panel's `margin-top: 20px`
  - Ensures no gap appears between sidebar top and background image
- ✅ **BEB Switch label removed** - Removed "Gebied:" label from bebouwde kom switch for cleaner appearance
  - Only dropdown selector remains visible
  - Reduces visual clutter in indicator titles
- ✅ **Dynamic indicator title spacing** - Reduced top padding when both switches present
  - Normal: `padding-top: 25px`
  - Both BEB + Year switches: `padding-top: 5px`
  - Provides more room for switches without title overlap
- ✅ **Dependency cleanup** - Removed unused `svelte-fuzzy` package
  - Configured Vite to suppress harmless `svelte-carousel` export warnings

**Technical implementation:**
- `src/lib/components/controlPanel/ControlPanel.svelte` - Background image positioning fix
- `src/lib/components/BEBSwitch.svelte` - Removed label span
- `src/lib/components/IndicatorTitle.svelte` - Conditional padding based on switch presence
- `vite.config.js` - Warning suppression for older Svelte packages
- `package.json` - Removed unused dependency

### Custom Indicator Filter Dropdown (2025-11-20)

**Replaced third-party MultiSelect component with custom-built dropdown** for better control and styling consistency:

- ✅ **Custom multi-select dropdown** - Built from scratch with full control over behavior and styling
- ✅ **Category headers** - Indicators grouped by category (Effecten, Gebiedskenmerken, Kwetsbaarheid) with steelblue/gray styling
- ✅ **Search filtering** - Type to filter indicators while keeping category headers visible
- ✅ **Tag-based selection** - Selected indicators appear as tags in input area, disappear from dropdown
- ✅ **Green theme integration** - Matches app's green color scheme (#36575a) with white borders
- ✅ **Remove all functionality** - White × button in top-right corner to clear all selections
- ✅ **Reactive filtering** - Selected items automatically excluded from dropdown list

**Features:**
- Tags show selected indicators with individual × to remove
- Click any indicator to select it - appears as tag and disappears from list
- Search box filters indicators while maintaining category structure
- Clear all button always visible in top-right when items are selected
- Proper click-outside-to-close behavior

**Technical implementation:**
- `src/lib/components/controlPanel/indicatorFilter.svelte` - Complete custom dropdown implementation
- Direct manipulation of `indicatorsSelection` store for immediate reactivity
- Category headers conditionally rendered (not just hidden) for clean filtering
- Green background (#36575a), white borders, white text, rounded corners (8px)

### Iframe Embedding & Null Safety Fixes (2025-11-06)

**Fixed iframe embedding issues** and **production crash bugs**:

- ✅ **Iframe race condition fixed** - Standalone and iframe modes now properly isolated
  - Standalone: Loads URL params from window.location.search once on mount
  - Iframe: Receives URL params via postMessage from parent, never overwritten
- ✅ **Null safety throughout** - Added comprehensive null checks for data access
  - `selectedNeighbourhoodJSONData` null checks in ControlPanel, Stats, BarPlot
  - Null feature filtering in prepareJSONData before processing
  - Safe property access throughout derived stores
- ✅ **Multiple URL parameters preserved** - Fixed URLSearchParams handling
  - GemeenteSelect, BuurtSelect, indicatorFilter now create fresh URLSearchParams
  - Properly preserves all parameters when adding/removing values
- ✅ **Multiple indicators persist on reload** - Fixed parent path preservation
  - Issue: Iframe sent `/buurtdashboard?...` but parent page is at `/nl/buurtdashboard`
  - Server redirect `/buurtdashboard` → `/nl/buurtdashboard` lost multi-value parameters
  - Fix: Store parent's pathname (including language prefix) and reuse when sending updates
  - Result: No redirect needed, all indicators survive reload

**Root Cause Analysis (Multiple Indicators):**
- **Problem:** After selecting 3 indicators and reloading, only the first remained
- **Why gemeente/buurt worked:** Single-value parameters (`gemeente=GM0344`) survived redirect
- **Why indicators didn't:** Multi-value parameters lost all but first during server redirect
- **The redirect culprit:** Server's redirect logic used `.get('indicator')` instead of `.getAll('indicator')`
- **Solution:** Send correct path from start (`/nl/buurtdashboard`) to avoid redirect entirely

**Technical implementation:**
- `src/routes/+page.svelte:108-130` - Iframe detection and conditional URL loading
- `src/lib/services/urlManager.js:19-40` - Parent path storage and preservation
- `src/lib/services/urlManager.js:129-136` - Extract and store parent pathname from URL
- `src/lib/stores.js:110-121` - Null-safe selectedNeighbourhoodJSONData derivation
- `src/lib/services/prepareJSONData.js:177` - Final null filter before processing
- `src/lib/components/controlPanel/*` - Preserved URL parameter handling

### Dataset Version Management (2025-11-04)

**Centralized configuration** and **precalculated aggregates** for better maintainability:

- ✅ **Single source of truth** - `src/lib/datasets.js` (renamed from .ts) contains all data URLs and version
- ✅ **Precalculation script** - `scripts/precalculate-nederland.js` imports from datasets.js
- ✅ **Version stamping** - Aggregates include version number for automatic cache validation
- ✅ **Instant Nederland stats** - No runtime calculation for 13,000+ neighborhoods

**Workflow for data updates:**
1. Update `DATASET_VERSION` and URLs in `src/lib/datasets.js`
2. Run `npm run precalculate-nederland`
3. Commit `datasets.js` and `nederland-aggregates.json`
4. Deploy with automatic version sync

**Technical files:**
- `src/lib/datasets.js` - Centralized data configuration (current version: `20251104`)
- `scripts/precalculate-nederland.js` - Aggregates precalculation script
- `static/nederland-aggregates.json` - Generated aggregates cache

### Amsterdam Performance Optimization (2025-11-02)

Massive performance improvements for large municipalities (100+ neighborhoods):

- ✅ **Viewport virtualization** - Only renders indicators near viewport (within 1 viewport distance)
- ✅ **Aggressive cleanup** - Unmounts far-away indicators (>2 viewports) every 500ms
- ✅ **Force simulation cleanup** - `onDestroy()` stops simulations and clears memory
- ✅ **Adaptive circle sizing** - Tiered sizing (2.5-4.5px) based on dataset size
- ✅ **Pre-positioned nodes** - Large/very large datasets initialize at target position (no sliding animation)
- ✅ **Tiered simulation** - Parameters adapt: very large (>100) uses 3 ticks, large (70-100) uses 5 ticks, etc.
- ✅ **Frozen positions** - Large datasets freeze after maxTicks with zero velocity to prevent jiggling

**Performance results:**
- Before: 3-5 seconds page freeze, progressive slowdown when scrolling
- After: <500ms to first interactive, smooth 60fps scrolling, ~70% memory reduction

**Technical implementation:**
- `src/lib/components/Indicator.svelte` - Virtualization wrapper with Intersection Observer
- `src/lib/components/IndicatorContent.svelte` - Original indicator (renamed)
- `src/lib/components/BeeswarmPlot.svelte` - Cleanup, tiered simulation parameters, pre-positioning, frozen positions
- `src/lib/stores.js` - Adaptive circle radius (2.5-4.5px tiered by neighborhood count)

### Full-Page Loading Screen (2025-10-23)

The app now features an **immediate full-page loading screen** for better user experience:

- ✅ **Instant feedback** - Loading screen appears in <50ms (pure HTML, no JavaScript required)
- ✅ **Smooth transition** - Loading screen disappears when UI elements are ready to be shown
- ✅ **Component-level loading** - Individual maps and charts show loading spinners while data loads
- ✅ **No artificial delays** - All timing is based on actual rendering and data loading

**Technical implementation:**
- `src/app.html` - Static HTML loading screen with spinner and text
- `src/routes/+page.svelte` - Removes loading screen after UI renders using `tick()` and `requestAnimationFrame()`
- Client-side SSR disabled (`ssr = false` in `+layout.js`) for SPA behavior

### AHN Version Reactivity & Nederland Aggregates (2025-10-23)

Improved performance and reactivity for AHN (height data) version switching:

- ✅ **Per-indicator stores** - Each indicator has isolated state for AHN version, year, and BEB selection
- ✅ **Memoized color scales** - Color scales only recreate when relevant data changes
- ✅ **Precalculated Nederland aggregates** - Server-side precalculation for instant Nederland-level statistics
- ✅ **Reactive Stats component** - Stats bars update immediately when switching AHN versions or years
- ✅ **Reactive BarPlot** - Bar charts recalculate only when their specific indicator data changes

**Technical implementation:**
- `src/lib/stores.js` - Added `getIndicatorStore()` factory for per-indicator reactive stores
- `scripts/precalculate-nederland.js` - Precalculates all Nederland aggregates (imports from datasets.js)
- `static/nederland-aggregates.json` - Cached aggregates loaded at runtime
- `src/lib/components/Stats.svelte` - Uses cached Nederland values with reactive fallback
- `src/lib/components/BarPlot.svelte` - Reactive to indicator-specific store changes
- `src/lib/components/Indicator.svelte` - Memoized color scale creation with proper dependencies

**Performance gains:**
- Nederland stats load instantly (no client-side calculation for 13,000+ neighborhoods)
- Switching AHN versions only updates affected components
- Color scales don't recreate on unrelated state changes

### Progressive Loading Implementation (2025-10-20)

The app uses **progressive loading** for optimal perceived performance:

- ✅ **UI appears quickly** - Side panel, map container, and indicators show immediately with loading states
- ✅ **Background data loading** - GeoJSON loads client-side without blocking page render
- ✅ **Smooth transitions** - Components fill with real data as it becomes available
- ✅ **Loading states** - Spinners and progress indicators throughout

**Technical changes:**
- `src/routes/+page.js` - Removed blocking GeoJSON fetch
- `src/routes/+page.svelte` - Added client-side data loading in `onMount()`
- `src/lib/components/Map.svelte` - Progressive map rendering with initialization guards
- `src/lib/components/IndicatorBody.svelte` - Loading spinners for maps

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
1. Server loads lightweight data (indicators config + CSV)
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
- Check CSV column names match indicators config `attribute` field
- Verify semicolon-separated format with Dutch decimal comma
- Check browser console for parsing errors

For more troubleshooting tips, see [.claude/project.md](.claude/project.md).