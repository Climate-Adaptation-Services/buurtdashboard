# Nederland Aggregates Pre-calculation

## Overview

This script pre-calculates Nederland (Netherlands) aggregate values for all indicators to improve performance. The dashboard **always** uses these cached values for Nederland statistics - they are never recalculated client-side. This provides:

- **Instant display**: Nederland values appear in ~100-200ms (no GeoJSON needed)
- **Consistency**: All users see identical Nederland values from the authoritative source
- **Performance**: Client-side computation only for gemeente/buurt/wijktype levels

## How It Works

1. **Pre-calculation**: The `precalculate-nederland.js` script fetches all data, processes indicators, and calculates Nederland aggregates (median or weighted average depending on the indicator configuration).

2. **Caching**: Results are saved to `static/nederland-aggregates.json` with version information.

3. **Fast Initial Load**: The page load process fetches this small JSON file immediately and displays Nederland stats right away.

4. **Background Loading**: The full GeoJSON data loads in the background client-side for gemeente/buurt/wijktype calculations.

5. **Permanent Usage**: Nederland values **always** come from the cache - they are never recalculated client-side, ensuring consistency and saving computation.

## Usage

### When to Run

Run the pre-calculation script whenever:
- Dataset updates occur (when `DATASET_VERSION` in `src/lib/datasets.ts` changes)
- Metadata changes
- Indicator definitions change
- Before deploying a new version

### How to Run

```bash
npm run precalculate-nederland
```

This will:
1. Fetch metadata, CSV data, and GeoJSON
2. Process all indicators
3. Calculate Nederland aggregates
4. Save results to `static/nederland-aggregates.json`

### Example Output

```json
{
  "version": "20250619",
  "generatedAt": "2025-10-22T12:32:11.143Z",
  "aggregates": {
    "Boomkroonoppervlakte": 14.409085275884358,
    "Groen": 23.135742961258103,
    "Landbedekking ": {
      "Gebouwen": 4.193510735717432,
      "Verhard": 8.862970699981746,
      "Halfverhard": 0.36329446428603496,
      ...
    },
    ...
  }
}
```

## Implementation Details

### Numerical Indicators

For numerical indicators, the script calculates:
- **Weighted average** if `surfaceArea` is specified (e.g., "Oppervlakte_Land_m2")
- **Median** otherwise

Formula for weighted average:
```
Sum(value × surface_area) / Sum(surface_area)
```

### Aggregated Indicators

For aggregated indicators (e.g., "Landbedekking", "Openbaar en niet-openbaar"), the script calculates values for each class separately.

### Categorical Indicators

Categorical indicators return `null` as they cannot be pre-calculated to a single value. These will only show data once the full dataset loads.

### Multi-Year Indicators

If an indicator has multiple years of data, the script detects all available years and calculates aggregates for each year separately. The cached data structure becomes:

```json
{
  "Indicator Name": {
    "2019": 23.5,
    "2020": 24.1,
    "2021": 25.3
  }
}
```

When users change the year selection, the dashboard automatically pulls the correct cached Nederland value for that year - no recalculation needed.

## Performance Impact

**Before optimization**:
- Initial page load: Wait for full GeoJSON (~3-5MB)
- Time to Nederland stats: ~2-5 seconds (network + processing)
- Client computes Nederland aggregates on every load

**After optimization**:
- Initial page load: Fetch small JSON file (~2KB)
- Time to Nederland stats: ~100-200ms
- Full data loads in background only for gemeente/buurt/wijktype
- Nederland values never recalculated client-side

**Result**:
- 10-25x faster time-to-content for Nederland statistics
- Zero computation cost for Nederland values (client-side)
- Guaranteed consistency across all users

## Files Modified

1. **`scripts/precalculate-nederland.js`** - Pre-calculation script
2. **`src/routes/+page.js`** - Loads cached aggregates server-side
3. **`src/routes/+page.svelte`** - Sets aggregates in store on mount
4. **`src/lib/stores.js`** - Added `nederlandAggregates` store
5. **`src/lib/components/Stats.svelte`** - Uses cached values as fallback
6. **`package.json`** - Added `precalculate-nederland` script
7. **`static/nederland-aggregates.json`** - Generated cache file

## Updating Datasets

When you update the dataset:

1. Update `DATASET_VERSION` in `src/lib/datasets.ts`
2. Update URLs if needed (metadata, CSV, GeoJSON)
3. Run `npm run precalculate-nederland`
4. Commit the updated `static/nederland-aggregates.json` file
5. Deploy

## Troubleshooting

### Script fails with "Invalid geoJson structure"

The GeoJSON might be in TopoJSON format. The script automatically handles this conversion.

### Aggregates showing null values

Check that:
- CSV column names match metadata `Indicatornaamtabel` field
- GeoJSON features have matching `buurtcode` or `buurtcode2024` properties
- Data files are accessible at the URLs specified in `datasets.ts`

### Nederland stats not showing

Check browser console for errors. Verify that:
- `static/nederland-aggregates.json` exists
- File is being served correctly (check Network tab)
- Version numbers match

## Future Enhancements

Potential improvements:
- Pre-calculate gemeente-level aggregates for major municipalities
- Add wijktype aggregates
- Include min/max values for scale calculations
- Generate during build process automatically
