# Buurtdashboard - Claude Project Configuration

## Project Overview

A SvelteKit-based neighborhood dashboard application for visualizing Dutch neighborhood statistics with interactive maps, charts, and indicators. Features progressive data loading for optimal perceived performance.

**Purpose**: Provide citizens and policymakers with accessible, visual insights into neighborhood-level data including climate effects, demographics, and vulnerability indicators.

**Users**: General public, researchers, policymakers, urban planners

**Data Coverage**: Netherlands-wide with municipality and neighborhood (buurt) level granularity

**Data Sources**:
- Climate Effect Atlas (Klimaateffectatlas) data
- CBS (Statistics Netherlands) demographic data
- Custom vulnerability indicators

## Key Technologies

- **Framework**: SvelteKit (adapter-vercel for deployment)
- **Maps**: Leaflet.js with custom D3.js SVG overlay
- **Visualizations**: D3.js (beeswarm plots, bar charts, geographic projections)
- **Data Processing**: Client-side CSV parsing with compression support (gzip/zip via fflate)
- **State Management**: Svelte stores with reactive updates
- **Testing**: Playwright for E2E tests
- **Internationalization**: Dutch/English support

## Architecture

### Data Flow

1. **Server-Side (Lightweight)**: `src/routes/+page.js`
   - Fetches indicators config and CSV data only
   - Returns immediately for fast page rendering
   - No blocking GeoJSON fetch

2. **Client-Side (Progressive)**: `src/routes/+page.svelte`
   - UI renders immediately with skeleton states
   - GeoJSON fetched in `onMount()` after page appears
   - Progressive enhancement as data loads

3. **Data Processing**: `src/lib/services/prepareJSONData.js`
   - Converts GeoJSON to TopoJSON for efficiency
   - Merges CSV attributes with geographic features
   - Caches processed data in IndexedDB
   - Updates reactive stores

### Component Structure

```
+page.svelte (root)
├── ControlPanel (sidebar)
│   ├── BuurtSelect (neighborhood selector)
│   ├── GemeenteSelect (municipality selector)
│   └── IndicatorFilter
├── Map (main map with Leaflet + D3 overlay)
│   └── MapPath (individual geographic features)
└── Indicator (virtualization wrapper with Intersection Observer)
    └── IndicatorContent (original indicator implementation)
        ├── IndicatorTitle
        ├── IndicatorBody
        │   ├── IndicatorQuantitative
        │   │   ├── BeeswarmPlot (with onDestroy cleanup)
        │   │   ├── BarPlot
        │   │   └── Stats
        │   └── IndicatorCategorical
        └── IndicatorInfo
```

**Note**: `Indicator.svelte` wraps `IndicatorContent.svelte` with viewport detection for performance optimization. Only indicators near the viewport are rendered; far-away indicators are unmounted to stop expensive force simulations.

### State Management

**Main Stores** (`src/lib/stores.js`):
- `allMunicipalitiesJSONData` - All municipality GeoJSON
- `allNeighbourhoodsJSONData` - All neighborhood GeoJSON
- `municipalitySelection` - Currently selected municipality
- `neighbourhoodSelection` - Currently selected neighborhood
- `configStore` - App configuration (colors, branding, data URLs)

**Derived Stores**:
- `currentJSONData` - Filtered GeoJSON based on selections
- `neighbourhoodsInMunicipalityJSONData` - Neighborhoods in selected municipality
- `selectedNeighbourhoodJSONData` - Currently selected neighborhood data

**Indicator Stores**:
- `getIndicatorStore(indicatorTitle)` - Isolated store per indicator for year/BEB selections

### Map Integration

**Dual Rendering System**:

1. **Main Map** (`Map.svelte` with `mapType="main map"`):
   - Leaflet background map (OpenStreetMap)
   - D3 SVG overlay synchronized with Leaflet transforms
   - Interactive zooming/panning via `LeafletMapManager`
   - Dynamic projection that updates with map movement

2. **Indicator Maps** (small static maps in indicator cards):
   - Pure D3 SVG (no Leaflet)
   - Static Mercator projection fitted to data
   - Non-interactive overview

**Critical Initialization Sequence**:
1. Leaflet map container created
2. Map initialized with dimensions
3. Map initialized with data (sets center/zoom) → `mapInitializedWithData = true`
4. Projection created (only after step 3)
5. Paths rendered

## Recent Improvements (2025-11-04)

### Dataset Version Management & Nederland Aggregates Precalculation

**Problem**: Data source URLs and version numbers were hardcoded in multiple places, requiring manual synchronization when updating datasets. Additionally, calculating Nederland-level aggregates from 13,000+ neighborhoods at runtime was expensive.

**Solution**: Centralized dataset configuration and server-side precalculation of Nederland aggregates:

1. **Single Source of Truth** (`src/lib/datasets.js`):
   - Renamed from `datasets.ts` to `.js` to enable Node.js imports
   - All data URLs and version number defined in one place
   - Both client and server code import from this file
   - Eliminates duplication and sync issues

```javascript
// src/lib/datasets.js
export const DATASET_VERSION = '20251104'
export const DEFAULT_INDICATORS_CONFIG_URL = "https://..."
export const DEFAULT_CSV_DATA_URL = "https://..."
export const BUURT_GEOJSON_URL = "https://..."
```

2. **Precalculation Script** (`scripts/precalculate-nederland.js`):
   - Runs during build or on-demand via `npm run precalculate-nederland`
   - Fetches all data (indicators config, CSV, GeoJSON)
   - Calculates Nederland aggregates for all indicators (median or weighted average)
   - Saves to `static/nederland-aggregates.json` with version stamp
   - Supports multi-year, BEB variants, and AHN version indicators

3. **Automatic Version Detection**:
   - Client checks if cached aggregates match current `DATASET_VERSION`
   - Console warning if version mismatch detected
   - Forces precalculation when dataset updated

4. **Performance Impact**:
   - Nederland stats load instantly (no runtime calculation)
   - Reduces client-side CPU usage
   - Smaller memory footprint during initialization

**Workflow When Updating Data**:
1. Update URLs and `DATASET_VERSION` in `src/lib/datasets.js`
2. Run `npm run precalculate-nederland`
3. Commit both `datasets.js` and `nederland-aggregates.json`
4. Deploy - version automatically syncs

**Files Modified**:
- `src/lib/datasets.ts` → `src/lib/datasets.js` - Centralized configuration
- `scripts/precalculate-nederland.js` - Imports from datasets.js
- `static/nederland-aggregates.json` - Generated aggregates with version stamp

**Current Dataset Version**: `20251104`

## Recent Improvements (2025-11-02)

### Amsterdam Performance Optimization - Viewport Virtualization

**Problem**: When selecting Amsterdam or other large municipalities (100+ neighborhoods), the page would become unresponsive and progressively slower as users scrolled through beeswarm plots. All force simulations ran simultaneously, causing browser freeze.

**Solution**: Implemented viewport-based virtualization with aggressive cleanup:

1. **Component Restructure**:
   - Renamed `Indicator.svelte` → `IndicatorContent.svelte` (contains actual indicator UI)
   - Created new `Indicator.svelte` as virtualization wrapper with Intersection Observer
   - Transparent to parent components - same API

2. **Viewport Detection** (`src/lib/components/Indicator.svelte`):
   - Intersection Observer with `rootMargin: 100%` loads indicators 1 viewport ahead
   - Shows lightweight skeleton placeholder for off-screen indicators
   - Periodic cleanup (500ms) actively unmounts indicators >2 viewports away

3. **Force Simulation Cleanup** (`src/lib/components/BeeswarmPlot.svelte`):
   - Added `onDestroy()` lifecycle hook to stop simulations and clear nodes
   - Prevents memory leaks and accumulating background processes
   - Debounced simulation restarts (100ms) to prevent rapid re-initialization

4. **Adaptive Simulation Parameters** (tiered by dataset size):
   - **Very large (100+ neighborhoods)**: Pre-positioned at target X, alpha 0.2, decay 0.95, 3 ticks, 2.5-3px circles
   - **Large (70-100 neighborhoods)**: Pre-positioned, alpha 0.15, decay 0.3, 5 ticks, 4px circles
   - **Medium (40-70 neighborhoods)**: Alpha 0.3, decay 0.03, 10 ticks, 4.3px circles
   - **Small (≤40 neighborhoods)**: Alpha 0.4, decay 0.015, 15 ticks, 4.5px circles
   - **Frozen positions**: Large/very large datasets freeze after maxTicks with vx=0, vy=0 to prevent jiggling
   - **Result**: Fast rendering with minimal collision artifacts across all municipality sizes

5. **Adaptive Circle Sizing** (`src/lib/stores.js`):
   - 150+ neighborhoods: 2.5px radius
   - 100-150 neighborhoods: 3px radius
   - 70-100 neighborhoods: 4px radius
   - 40-70 neighborhoods: 4.3px radius
   - ≤40 neighborhoods: 4.5px radius (default)

**Performance Results**:
- **Before**: 3-5 seconds page freeze, progressive slowdown when scrolling
- **After**: <500ms to first interactive content, smooth 60fps scrolling
- **Memory**: ~70% reduction through active unmounting
- **Simulations**: Maximum 3-4 active at once (vs 20+ accumulating)

**Technical Details**:
- Intersection Observer fires when indicators enter/exit 1-viewport margin
- `setInterval(500ms)` actively checks distance and unmounts far-away indicators
- BeeswarmPlot pre-positions nodes at `xScaleBeeswarm(value)` for large datasets
- Simulation parameters adapt: `alpha: 0.1`, `alphaDecay: 0.9`, `maxTicks: 3`

**Files Modified**:
- `src/lib/components/Indicator.svelte` - New virtualization wrapper
- `src/lib/components/IndicatorContent.svelte` - Original indicator (renamed)
- `src/lib/components/BeeswarmPlot.svelte` - Added cleanup, adaptive parameters, pre-positioning
- `src/lib/stores.js` - Adaptive circle radius based on neighborhood count
- `src/routes/+page.svelte` - Uses new Indicator wrapper (no API changes)

## Recent Improvements (2025-10-20)

### Progressive Loading Implementation

**Problem**: App showed blank screen for 2-3 seconds while loading all data.

**Solution**: Implemented progressive loading to show UI immediately:

1. **Modified `src/routes/+page.js`**:
   - Removed blocking GeoJSON fetch from server-side load
   - Only loads lightweight indicators config and CSV
   - Page renders ~2-3 seconds faster

2. **Updated `src/routes/+page.svelte`**:
   - Added `onMount()` hook for client-side GeoJSON loading
   - UI renders immediately with loading states
   - Progressive enhancement as data arrives

3. **Enhanced Components**:
   - `Map.svelte`: Shows Leaflet background immediately + loading spinner
   - `ControlPanel.svelte`: Shows panel structure + loading indicator
   - Original `Indicator.svelte`: Animated skeleton loaders with shimmer effect

4. **Fixed Leaflet Initialization Bug**:
   - Added `mapInitializedWithData` flag to track full initialization
   - Ensures projection only created after map has center/zoom set
   - Prevents "Set map center and zoom first" error

**Result**:
- UI appears in 0-100ms (instant)
- Data loads in background (1-3 seconds)
- Smooth transition to full functionality
- Dramatically improved perceived performance

## Recent Improvements (2025-10-22)

### Surface Area Weighting - Hybrid Approach

**Current Implementation**: The application now uses a **hybrid approach** that combines weighted averages for regional aggregates with raw values for individual neighborhoods.

**Aggregated Stats (Nederland/Gemeente)**:
- **Weighted averages** when `indicator.surfaceArea` is specified
- Formula: `sum(value * surface_area) / sum(surface_area)`
- Represents the "true regional percentage" across all land
- Accounts for neighborhood size differences
- Example: If small neighborhoods have 80% but large neighborhoods have 20%, the weighted average reflects where most land area actually is

**Individual Neighborhood Values (Buurt/Wijktype)**:
- **Raw percentage values** from the data (no surface area conversion)
- Displays what each neighborhood actually experiences
- Beeswarm plot dots: Raw values for positioning and colors
- Map colors: Raw values
- Stat bars: Raw values for display and positioning

**Technical Implementation** (`src/lib/components/Stats.svelte`):
```javascript
// Nederland aggregate - uses weighted average when surfaceArea specified
if (indicator.surfaceArea) {
  return calcWeightedAverage(
    $allNeighbourhoodsJSONData.features,
    (neighbourhood) => getNumericalValue(neighbourhood, indicator),
    indicator.surfaceArea,
    indicator
  )
} else {
  return calcMedian(values)
}

// Individual buurt value - uses raw value
buurtValue = getNumericalValue(feature, indicator)
```

**Example Scenario**:
For "Boomkroonoppervlakte openbaar" (tree crown in public areas):
- Individual neighborhood shows: `25%` (raw percentage from data)
- Nederland aggregate shows: `28%` (weighted by public area sizes)
- The weighted average gives more weight to neighborhoods with larger public areas

**Why This Approach**:
- **Aggregates**: Weighted averages answer "What percentage of Nederland's public areas has tree crown?"
- **Individual values**: Raw percentages answer "What percentage does this specific neighborhood have?"
- **Best of both worlds**: Regional truth + neighborhood-level accuracy

**Files Using Weighted Averages**:
- `src/lib/components/Stats.svelte` - Nederland and Gemeente aggregates only

**Files Using Raw Values**:
- `src/lib/components/Stats.svelte` - Buurt and Wijktype display values
- `src/lib/components/BeeswarmPlot.svelte` - Dot positioning and colors
- `src/lib/utils/getGlobalExtent.js` - Extent calculation
- `src/lib/map/mapColorUtils.js` - Map colors
- `src/lib/components/Indicator.svelte` - Color scale domain

**Helper Functions Available**:
- `calcWeightedAverage` - Used for Nederland/Gemeente aggregates
- `applySurfaceAreaConversion` - Available but not currently used (preserved for future use)

## Development Workflow

### Commands

```bash
npm run dev                      # Start development server (localhost:5173)
npm run build                    # Build for production
npm run preview                  # Preview production build
npm run check                    # Run Svelte type checking
npm run check:watch              # Type checking in watch mode
npm run precalculate-nederland   # Precalculate Nederland aggregates (required after data updates)
```

### Updating Data Sources

When updating dataset URLs or indicators config:

1. **Update centralized configuration** in `src/lib/datasets.js`:
   - Increment `DATASET_VERSION` (e.g., `'20251104'`)
   - Update URLs if needed (`DEFAULT_INDICATORS_CONFIG_URL`, `DEFAULT_CSV_DATA_URL`, etc.)

2. **Regenerate Nederland aggregates**:
   ```bash
   npm run precalculate-nederland
   ```
   This fetches all data and calculates pre-aggregated values for instant loading.

3. **Commit changes**:
   - `src/lib/datasets.js` (updated version and URLs)
   - `static/nederland-aggregates.json` (regenerated aggregates)

4. **Deploy**: Version automatically syncs between code and aggregates

### Testing

```bash
npx playwright test                    # Run all tests
npx playwright test --ui               # Interactive UI mode
npx playwright test --debug            # Debug mode
npx playwright test <test-file>        # Run specific test
```

**Test Location**: `/tests/`
**Screenshots**: `/tests/screenshots/` (visual regression testing)

### Data Sources

**Configuration**: `src/lib/config.js`
- Default config for standard deployment
- Dordrecht config for custom instance

**Data Files**:
- **Indicators Config**: CSV with indicator definitions (Dutch/English)
  - Location: `metadata.csv` and `metadata_english.csv` (CSV filenames unchanged)
  - Format: Semicolon-separated (`;`)
  - Contains: indicator titles, descriptions, categories, units, data types

- **Neighborhood Data**: Compressed CSV (gzip or zip)
  - Location: `neighbourhoodCSVdataLocation` in config
  - Format: Semicolon-separated (`;`), Dutch decimal comma (`,`)
  - Size: ~2-5MB compressed
  - Contains: All indicator values for all neighborhoods and years

- **GeoJSON**: Municipality and neighborhood boundaries
  - Municipality: `gemeenten_gegeneraliseerd.geojson` (~500KB)
  - Neighborhoods: `buurten_gegeneraliseerd.geojson` (~3-4MB)
  - Converted to TopoJSON for efficiency

**S3 Bucket**: `buurtdashboard-data.s3.eu-north-1.amazonaws.com/buurtdashboard-KEA/`

### Data Model

#### Indicators Config CSV Structure
```csv
title;plottitle;description;category;attribute;unit;datatype;reverse;ymin;ymax;aggregatedIndicator
Hittestress;Hittestress (%);Percentage inwoners met hittestress;Effecten;hittestress;%;quantitative;false;0;100;false
```

**Columns**:
- `title`: Unique identifier for the indicator
- `plottitle`: Display title for charts (may include unit)
- `description`: Full description shown in info panel
- `category`: One of "Effecten", "Gebiedskenmerken", "Kwetsbaarheid"
- `attribute`: CSV column name containing the data
- `unit`: Unit of measurement
- `datatype`: "quantitative" or "categorical"
- `reverse`: Whether lower values are better (for color scale)
- `ymin`/`ymax`: Chart axis limits
- `aggregatedIndicator`: Whether data is pre-aggregated at Nederland level

#### Neighborhood CSV Structure
```csv
buurtcode;gemeentecode;gemeentenaam;buurtnaam;jaar;hittestress;wateroverlast;...
BU00010000;GM0001;'s-Gravenhage;Centrum;2020;12.5;8.3;...
```

**Key Columns**:
- `buurtcode`: Unique neighborhood code (CBS format)
- `gemeentecode`: Municipality code
- `gemeentenaam`: Municipality name
- `buurtnaam`: Neighborhood name
- `jaar`: Year
- `[indicator attributes]`: One column per indicator

**Special Values**:
- `.` (period): Missing/no data
- Dutch decimal comma: `12,5` not `12.5`

#### GeoJSON Structure
```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "properties": {
        "GM_CODE": "GM0001",
        "GM_NAAM": "'s-Gravenhage",
        "BU_CODE": "BU00010000",
        "BU_NAAM": "Centrum"
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [[[...]]]
      }
    }
  ]
}
```

**Properties**:
- Municipality: `GM_CODE`, `GM_NAAM`
- Neighborhood: `BU_CODE`, `BU_NAAM`, `WK_CODE`
- After processing: CSV data merged into properties

## Key Features

### Interactive Maps
- Click neighborhoods to view detailed statistics
- Zoom and pan to explore specific areas
- Color-coded choropleth visualization
- Dynamic transparency control

### Data Visualizations
- **Beeswarm plots**: Distribution of neighborhoods
- **Bar charts**: Categorical data comparison
- **Choropleth maps**: Geographic patterns

### Multi-language Support
- Dutch (default)
- English
- Automatic translation via i18n stores

### URL State Management
- Selected municipality/neighborhood persisted in URL
- Shareable links to specific views
- Browser back/forward support

### Responsive Design
- Desktop: Side panel + scrollable indicators
- Mobile: Stacked layout

## Component API Reference

### Map Component

**File**: `src/lib/components/Map.svelte`

**Props**:
```javascript
{
  mapWidth: number,              // Container width in pixels
  mapHeight: number,             // Container height in pixels
  mapType: "main map" | string,  // "main map" for Leaflet, else static D3
  indicator: Object,             // Indicator configuration object
  indicatorValueColorscale: Function, // D3 color scale function
  isLoading: boolean             // Show loading state (default: false)
}
```

**Key Features**:
- Dual rendering mode (Leaflet + D3 vs pure D3)
- Progressive initialization with `mapInitializedWithData` guard
- Dynamic projection synced with Leaflet transforms
- Zoom/pan event handling with transition states

**Internal State**:
- `leafletReady`: Leaflet library loaded
- `mapInitializedWithData`: Map has center/zoom set
- `projection`: D3 projection (null until ready)
- `path`: D3 path generator (null until ready)

### Indicator Component

**File**: `src/lib/components/Indicator.svelte`

**Props**:
```javascript
{
  indicatorHeight: number,  // Card height in pixels
  indicator: Object,        // Indicator configuration
  isLoading: boolean        // Show skeleton state (default: false)
}
```

**Indicator Object Structure**:
```javascript
{
  title: string,              // Unique identifier
  plottitle: string,          // Display title
  description: string,        // Full description
  category: string,           // "Effecten" | "Gebiedskenmerken" | "Kwetsbaarheid"
  attribute: string,          // Data column name
  unit: string,               // Unit of measurement
  datatype: string,           // "quantitative" | "categorical"
  reverse: boolean,           // Lower is better?
  ymin: number,               // Chart Y-axis minimum
  ymax: number,               // Chart Y-axis maximum
  aggregatedIndicator: boolean // Pre-aggregated at national level?
}
```

### ControlPanel Component

**File**: `src/lib/components/controlPanel/ControlPanel.svelte`

**Props**:
```javascript
{
  allIndicators: Array<Object>,  // All available indicators
  indicatorsSelection: Array,    // Currently displayed indicators
  isLoading: boolean             // Show loading indicator
}
```

**Features**:
- Municipality dropdown (populated from GeoJSON)
- Neighborhood dropdown (filtered by selected municipality)
- Indicator filter (search/filter indicators)
- Download data button
- Info panels (intro, graph explanation)

### BeeswarmPlot Component

**File**: `src/lib/components/BeeswarmPlot.svelte`

**Props**:
```javascript
{
  graphWidth: number,
  graphHeight: number,
  indicator: Object,
  indicatorValueColorscale: Function,
  data: Array<Feature>,          // GeoJSON features with properties
  aggregated: boolean,           // Show aggregated view?
  getClassByIndicatorValue: Function
}
```

**Visualization**:
- Force simulation to prevent overlap
- Color-coded by value
- Hover interactions
- Selected neighborhood highlighted

### BarPlot Component

**File**: `src/lib/components/BarPlot.svelte`

**Props**:
```javascript
{
  graphWidth: number,
  graphHeight: number,
  indicator: Object,
  indicatorValueColorscale: Function,
  aggregated: boolean
}
```

**Features**:
- Stacked bars for categorical data
- Sorted by category
- Hover tooltips
- Percentage or absolute values

## URL Parameters

The application supports URL-based state management for shareable links.

**Supported Parameters**:

```
?gemeente=GM0363           // Pre-select municipality by code
&buurt=BU03630000          // Pre-select neighborhood by code
&lang=en                   // Set language (nl | en)
&config=dordrecht          // Use alternative config
```

**Examples**:
```
# Amsterdam Centrum
http://localhost:5173/?gemeente=GM0363&buurt=BU03630000

# English version
http://localhost:5173/?lang=en

# Dordrecht custom instance
http://localhost:5173/?config=dordrecht
```

**Implementation**: `src/lib/services/urlManager.js`
- `initializeURLManagement()`: Sets up listeners
- `processURLParameters()`: Processes URL params on load
- `updateURLParams()`: Updates URL when selections change

## Configuration Options

### Main Config (`src/lib/config.js`)

**defaultConfig**:
```javascript
{
  // Branding
  mainColor: "#35575a",           // Primary color (header, buttons)
  sidebarImage: "background.png", // Sidebar background image
  categoryPath: "",               // Category icon path suffix

  // Data URLs (S3 bucket)
  indicatorsConfigLocation: "https://.../metadata.csv",
  indicatorsConfigLocationEnglish: "https://.../metadata_english.csv",
  neighbourhoodCSVdataLocation: "https://.../data.csv.gz",

  // Feature toggles
  showDifferenceCalculation: true,  // Show year-over-year differences
  showBEBCalculation: true,          // Show BEB (Buitengewoon Energie Besparend) mode

  // Map settings
  defaultZoom: 8,
  defaultCenter: [52.0907, 5.1214] // Netherlands
}
```

**dordrechtConfig**: Extends defaultConfig with Dordrecht-specific branding

### Environment-Specific Config

**Development**:
```javascript
// No special config needed
// Uses defaultConfig from src/lib/config.js
```

**Production**:
```javascript
// Vercel deployment
// Uses same config, data from S3
```

**Custom Instances**:
```javascript
// Add new config object in src/lib/config.js
export const customConfig = {
  ...defaultConfig,
  mainColor: "#your-color",
  // ... override other properties
}

// Access via ?config=custom URL parameter
```

## Store Architecture Details

### Store Initialization Flow

1. **Data arrives** from `+page.js`:
```javascript
{
  indicatorsConfig: Array,
  indicatorsConfig_english: Array,
  buurtCSVdata: Array,
  neighbourhoodGeoJson: Object,  // May be null initially
  municipalityGeoJson: Object    // May be null initially
}
```

2. **Client-side processing** in `+page.svelte`:
```javascript
onMount(async () => {
  // Fetch GeoJSON
  const [municipalityGeoJson, neighbourhoodGeoJson] = await Promise.all([...])

  // Process and populate stores
  await prepareJSONData([municipalityGeoJson, neighbourhoodGeoJson], buurtCSVdata, urls)

  // Stores now populated:
  // - allMunicipalitiesJSONData
  // - allNeighbourhoodsJSONData
})
```

3. **Reactive derivations** trigger:
```javascript
// When user selects gemeente:
municipalitySelection.set("GM0363")

// Automatically triggers:
$currentJSONData → filtered neighborhoods
$neighbourhoodsInMunicipalityJSONData → dropdown options

// When user selects buurt:
neighbourhoodSelection.set("BU03630000")

// Automatically triggers:
$selectedNeighbourhoodJSONData → single neighborhood
Map zooms to selection
Charts update with neighborhood data
```

### Indicator Store Isolation

Each indicator gets its own isolated store to prevent year/BEB selection conflicts:

```javascript
// src/lib/stores.js
const indicatorStores = {}

export function getIndicatorStore(indicatorTitle) {
  if (!indicatorStores[indicatorTitle]) {
    indicatorStores[indicatorTitle] = writable({
      selectedYear: null,
      isBEB: false
    })
  }
  return indicatorStores[indicatorTitle]
}
```

**Usage in Indicator component**:
```javascript
const indicatorStore = getIndicatorStore(indicator.title)

// Each indicator independently tracks:
$indicatorStore.selectedYear  // Year selection for THIS indicator
$indicatorStore.isBEB         // BEB mode for THIS indicator
```

## Common Development Tasks

### Adding a New Indicator

1. Add indicator definition to CSV files:
   - `indicatorsConfigLocation` (Dutch)
   - `indicatorsConfigLocationEnglish`

2. Ensure data exists in neighborhood CSV with matching column name

3. Indicator auto-appears in dashboard (no code changes needed)

### Modifying Map Styles

**Main map background**: `src/lib/services/LeafletMapManager.js`
```javascript
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  // Modify tile layer options
})
```

**D3 overlay colors**: `src/lib/map/mapColorUtils.js`
- `getMapFillColor()` - Color calculation logic
- Uses indicator-specific color scales

### Changing Branding

**Configuration**: `src/lib/config.js`
```javascript
export const defaultConfig = {
  mainColor: "#35575a",           // Primary color
  sidebarImage: "background.png", // Sidebar background
  categoryPath: "",                // Category icon path suffix
  // ... other config
}
```

### Performance Optimization

**Current optimizations**:
- Progressive loading (UI appears immediately)
- TopoJSON conversion (smaller file size)
- IndexedDB caching (faster subsequent loads)
- Derived stores (avoid redundant calculations)
- Virtual scrolling for long lists (if needed: use svelte-virtual-list)

**Monitor**:
- Network tab: Check GeoJSON size (~2-4MB typical)
- Performance tab: Check reactive update times
- Lighthouse: Overall performance score

## Deployment

**Platform**: Vercel
**Adapter**: `@sveltejs/adapter-vercel`

**Build output**:
- Static assets: `.svelte-kit/output/client/`
- Server functions: `.svelte-kit/output/server/`
- Vercel config: `.vercel/output/`

**Environment**:
- No environment variables required (data URLs in config)
- Public S3 bucket for data access

## Troubleshooting

### "Set map center and zoom first" Error
**Cause**: Projection created before Leaflet map fully initialized
**Fix**: Check `mapInitializedWithData` flag in `Map.svelte`

### Slow Initial Load
**Check**:
1. GeoJSON file size (should be <5MB)
2. Network throttling in DevTools
3. Progressive loading implementation
4. IndexedDB cache working

### Data Not Showing
**Check**:
1. CSV column names match indicators config `attribute` field
2. Data format (semicolon-separated, Dutch decimal comma)
3. Browser console for parsing errors
4. Network tab for failed fetches

### Map Not Rendering
**Check**:
1. Leaflet CSS imported
2. Map container has dimensions (bind:clientWidth/clientHeight)
3. GeoJSON data loaded in stores
4. No console errors about projections

## Code Style

- **Indentation**: 2 spaces
- **Quotes**: Double quotes for strings
- **Semicolons**: Optional (project uses them inconsistently)
- **Svelte**: Reactive statements with `$:` syntax
- **Comments**: Explain "why" not "what"

## Important Files

### Configuration
- `src/lib/config.js` - App configuration
- `src/lib/datasets.js` - **Single source of truth** for data URLs and version (updated from datasets.ts)
- `vercel.json` - Deployment config

### Data Management
- `scripts/precalculate-nederland.js` - Precalculates Nederland aggregates from source data
- `static/nederland-aggregates.json` - Cached aggregates with version stamp (generated, not hand-edited)

### Core Services
- `src/lib/services/prepareJSONData.js` - Data processing pipeline
- `src/lib/services/LeafletMapManager.js` - Map management
- `src/lib/services/setupIndicators.js` - Indicator initialization
- `src/lib/services/urlManager.js` - URL state management

### Stores
- `src/lib/stores.js` - All application state

### Utils
- `src/lib/map/mapColorUtils.js` - Color calculations
- `src/lib/utils/` - Various helper functions

## Performance Metrics

### Target Performance (After Progressive Loading)

**Initial Page Load**:
- Time to First Byte (TTFB): < 200ms
- First Contentful Paint (FCP): < 500ms
- Largest Contentful Paint (LCP): < 1.5s
- Time to Interactive (TTI): < 3s (with skeleton UI at 500ms)

**Data Loading**:
- Indicators config + CSV: 300-800ms
- GeoJSON: 1-2s (background, non-blocking)
- Total data: 2-5MB compressed

**Runtime Performance**:
- Map pan/zoom: 60 FPS
- Chart updates: < 100ms
- Selection changes: < 200ms

### Actual Measurements

**Before Progressive Loading**:
- Blank screen: 2-3 seconds
- Total load time: 3-4 seconds
- Poor perceived performance

**After Progressive Loading**:
- UI visible: 100-300ms
- Skeleton UI: Immediate
- Full interactivity: 1.5-2.5 seconds
- Excellent perceived performance

### Performance Optimization Techniques

1. **Progressive Loading** (implemented 2025-10-20)
   - Server-side: Only lightweight data
   - Client-side: GeoJSON in background
   - UI renders immediately with skeletons

2. **Data Optimization**:
   - TopoJSON conversion (30-50% size reduction)
   - Gzip compression on CSV (80-90% reduction)
   - IndexedDB caching (instant subsequent loads)

3. **Rendering Optimization**:
   - Virtual scrolling for long lists (if implemented)
   - Debounced map updates (500ms)
   - Reactive store derivations (avoid recalculation)
   - CSS transitions for smooth animations

4. **Code Splitting**:
   - Lazy load heavy components
   - Dynamic imports for large libraries
   - SvelteKit automatic code splitting

### Monitoring Tools

**Development**:
```bash
# Lighthouse audit
npx lighthouse http://localhost:5173 --view

# Bundle analysis
npm run build
npx vite-bundle-visualizer
```

**Production**:
- Vercel Analytics (automatic with deployment)
- Web Vitals monitoring
- Error tracking (Sentry if configured)

## Browser Compatibility

### Supported Browsers

**Desktop**:
- Chrome 90+ ✅
- Firefox 88+ ✅
- Safari 14+ ✅
- Edge 90+ ✅

**Mobile**:
- iOS Safari 14+ ✅
- Chrome Android 90+ ✅
- Samsung Internet 14+ ✅

### Required Features

**JavaScript**:
- ES2020 syntax (optional chaining, nullish coalescing)
- Promises and async/await
- Fetch API
- IndexedDB

**CSS**:
- CSS Grid
- Flexbox
- CSS Custom Properties
- CSS Transitions

### Polyfills

**Included automatically by Vite**:
- No manual polyfills needed for supported browsers
- Vite handles syntax transpilation

**Not Supported**:
- Internet Explorer (any version)
- Very old mobile browsers (< 2020)

### Testing Browsers

**Priority 1** (Must work perfectly):
- Chrome (latest)
- Safari (latest)

**Priority 2** (Should work well):
- Firefox (latest)
- Edge (latest)

**Priority 3** (Best effort):
- Mobile browsers (latest)
- Older versions (1-2 years old)

## Accessibility Features

### Current Implementation

**Keyboard Navigation**:
- ⚠️ Limited support (needs improvement)
- Tab navigation works for buttons and links
- Map interaction requires mouse

**Screen Reader Support**:
- ⚠️ Partial support (needs improvement)
- Semantic HTML used where possible
- Missing ARIA labels on many interactive elements
- SVG visualizations lack text alternatives

**Color Contrast**:
- ✅ Good - Main text meets WCAG AA
- ⚠️ Some chart elements may fail AA on certain backgrounds
- ✅ Color not sole means of conveying information (patterns + labels)

**Responsive Text**:
- ✅ Text scales with browser zoom
- ✅ No absolute font sizes that break at zoom
- ✅ Readable on mobile devices

### Accessibility Improvements Needed

**High Priority**:
1. Add ARIA labels to all interactive elements
2. Add keyboard navigation for map interactions
3. Add text alternatives for all visualizations
4. Add focus indicators for all interactive elements

**Medium Priority**:
1. Add skip-to-content links
2. Improve color contrast in charts
3. Add landmark roles for major sections
4. Add live region announcements for dynamic content

**Low Priority**:
1. Add reduced motion preference support
2. Add high contrast mode
3. Add focus visible polyfill for older browsers

### Accessibility Testing

**Manual Testing**:
```bash
# Screen reader testing
# - macOS: VoiceOver (Cmd+F5)
# - Windows: NVDA (free)

# Keyboard testing
# - Tab through all interactive elements
# - Ensure all actions possible without mouse

# Color blindness simulation
# - Chrome DevTools > Rendering > Emulate vision deficiencies
```

**Automated Testing**:
```bash
# Axe accessibility testing
npm install -D @axe-core/playwright

# Add to Playwright tests
import { injectAxe, checkA11y } from 'axe-playwright'
```

### WCAG Compliance

**Current Level**: Partially AA
**Target Level**: AA (WCAG 2.1)
**Known Issues**:
- Missing ARIA labels (Criterion 4.1.2)
- Keyboard navigation incomplete (Criterion 2.1.1)
- Some color contrast issues (Criterion 1.4.3)

## Internationalization (i18n)

### Supported Languages

1. **Dutch (nl)** - Default
   - Full translation
   - Primary user base

2. **English (en)**
   - Full translation
   - International users, researchers

### Translation System

**Implementation**: `src/lib/i18n/translate.js`

```javascript
import { languageStore } from "$lib/stores"
import { get } from "svelte/store"

export function t(key) {
  const lang = get(languageStore)
  return translations[lang][key] || key
}
```

**Usage in Components**:
```svelte
<script>
  import { t } from "$lib/i18n/translate.js"
</script>

<h1>{t("Uitleg_grafieken")}</h1>
```

### Translation Files

**Structure**: `src/lib/i18n/`
- `nl.js` - Dutch translations
- `en.js` - English translations
- `translate.js` - Translation function

**Adding New Translations**:
1. Add key to both `nl.js` and `en.js`
2. Use `t("key")` in components
3. No code changes needed

### Language Selection

**URL Parameter**:
```
?lang=en  // Switch to English
?lang=nl  // Switch to Dutch (default)
```

**Persistence**:
- Stored in `languageStore`
- Not persisted across sessions
- Always defaults to Dutch on new load

## Security Considerations

### Data Security

**Public Data**:
- All neighborhood data is public domain
- No sensitive personal information
- No authentication required

**S3 Bucket**:
- Public read-only access
- No write permissions from client
- Data versioned and immutable

### Client Security

**XSS Protection**:
- Svelte automatic escaping
- No dangerouslySetInnerHTML equivalent used
- User input sanitized in URL parameters

**CORS**:
- S3 bucket configured for CORS
- Allows requests from any origin (public data)

**CSP** (Content Security Policy):
- ⚠️ Not explicitly configured
- Relying on Vercel defaults
- Should be added for production

### Recommended Security Headers

**Add to `vercel.json`**:
```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Frame-Options",
          "value": "SAMEORIGIN"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        }
      ]
    }
  ]
}
```

## Performance Optimization Guidelines

### Viewport Virtualization Pattern

**When to Use**:
- Lists with 20+ complex components
- Force simulations or expensive calculations per item
- User scrolls through content (not all visible at once)

**Implementation** (`Indicator.svelte` example):
1. Intersection Observer with `rootMargin: "100%"` (load 1 viewport ahead)
2. Skeleton placeholder for off-screen items
3. Periodic cleanup (`setInterval(500ms)`) to unmount far items (>2 viewports)
4. `onDestroy()` lifecycle to stop background processes

**Key Principles**:
- Load ahead for smooth UX (no blank frames during scroll)
- Aggressive cleanup to prevent memory leaks
- Always implement `onDestroy()` for D3 simulations, timers, subscriptions

### Force Simulation Best Practices

**Adaptive Parameters** (see `BeeswarmPlot.svelte`):
```javascript
const nodeCount = data.length
const isMediumDataset = nodeCount > 40
const isLargeDataset = nodeCount > 70
const isVeryLargeDataset = nodeCount > 100

const params = {
  alpha: isVeryLargeDataset ? 0.2 : isLargeDataset ? 0.15 : isMediumDataset ? 0.3 : 0.4,
  alphaDecay: isVeryLargeDataset ? 0.95 : isLargeDataset ? 0.3 : isMediumDataset ? 0.03 : 0.015,
  maxTicks: isVeryLargeDataset ? 3 : isLargeDataset ? 5 : isMediumDataset ? 10 : 15,
  xStrength: isVeryLargeDataset ? 1.0 : isLargeDataset ? 0.9 : isMediumDataset ? 0.7 : 0.5,
}
```

**Pre-positioning for Large Datasets**:
```javascript
if (isLargeDataset || isVeryLargeDataset) {
  plotData.forEach(d => {
    d.x = xScale(getValue(d))  // Start at target X
    d.y = 70                   // Start at center Y
  })
}
```

**Cleanup Pattern**:
```javascript
onDestroy(() => {
  if (simulation) {
    simulation.stop()
    simulation.nodes([])  // Clear memory
  }
  if (debounceTimer) {
    clearTimeout(debounceTimer)
  }
})
```

### Circle Sizing Strategy

**Adaptive Radius** (`src/lib/stores.js`):
```javascript
export const circleRadius = derived([neighbourhoodsInMunicipalityJSONData], ([$data]) => {
  const count = $data?.features?.length || 0
  if (count > 150) return 2.5  // Very large datasets
  if (count > 100) return 3.0  // Large datasets (100-150)
  if (count > 70)  return 4.0  // Large datasets (70-100)
  if (count > 40)  return 4.3  // Medium datasets (40-70)
  return 4.5                    // Small datasets (≤40)
})
```

**Why It Works**:
- Smaller circles = less collision detection work
- Fewer overlaps = faster convergence
- Better visual density for large datasets
- Tiered approach matches simulation parameter tiers

## Error Handling

### Current Error Handling

**Data Loading Errors**:
```javascript
// src/routes/+page.svelte
try {
  const [municipalityResponse, neighbourhoodResponse] = await Promise.all([...])
  // ... process data
} catch (error) {
  console.error('Error loading GeoJSON data:', error)
  isLoadingGeoJSON = false
}
```

**Runtime Errors**:
- Console logging only
- No user-facing error messages
- Graceful degradation (empty states)

### Recommended Improvements

**User-Facing Errors**:
```svelte
{#if error}
  <div class="error-message">
    <h2>Er is iets misgegaan</h2>
    <p>{error.message}</p>
    <button on:click={retry}>Opnieuw proberen</button>
  </div>
{/if}
```

**Error Tracking**:
```javascript
// Add Sentry or similar
import * as Sentry from "@sentry/sveltekit"

Sentry.init({
  dsn: "...",
  integrations: [new Sentry.BrowserTracing()],
  tracesSampleRate: 0.1
})
```

**Network Error Recovery**:
- Retry failed requests (with exponential backoff)
- Show offline indicator
- Cache data for offline viewing (via IndexedDB)

## Notes for Future Development

### Progressive Enhancement Checklist
When adding new features, ensure:
- [ ] Component renders without data (skeleton/loading state)
- [ ] Reactive to store updates
- [ ] No blocking async operations in component initialization
- [ ] Loading states have proper styling

### Performance Checklist
- [ ] Minimize store subscriptions in tight loops
- [ ] Use derived stores for computed values
- [ ] Debounce frequent updates (map pan/zoom)
- [ ] Lazy load heavy components if possible

### Accessibility Checklist
- [ ] Keyboard navigation support
- [ ] ARIA labels for interactive elements
- [ ] Color contrast meets WCAG AA
- [ ] Screen reader friendly text alternatives
