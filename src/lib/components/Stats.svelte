<script>
  import {
    allNeighbourhoodsJSONData,
    districtTypeJSONData,
    districtTypeAbbreviation,
    municipalitySelection,
    neighbourhoodSelection,
    neighbourhoodCodeAbbreviation,
    municipalityCodeAbbreviation,
    selectedNeighbourhoodJSONData,
    getIndicatorStore,
    nederlandAggregates,
    configStore,
  } from "$lib/stores"
  import Stat from "./Stat.svelte"
  import { scaleLinear, min, max } from "d3"
  import { calcMedian, calcAverage } from "$lib/utils/calcMedian"
  // MIGRATED: Import centralized value retrieval functions
  import { getNumericalValue, getDifferenceValue, getIndicatorAttribute, toNumber, isValidValue, getRawValue, getNoDataReason } from "$lib/utils/valueRetrieval.js"

  export let bodyHeight
  export let indicator
  export let indicatorValueColorscale

  let statsWidth

  // MIGRATED: Use centralized AHN selection handling with reactive store dependency
  // Use dutchTitle for store key to ensure consistency across languages
  const indicatorStore = getIndicatorStore(indicator.dutchTitle || indicator.title)

  // Keep these at top level for template access
  $: currentAHNSelection = $indicatorStore
  $: isDifferenceMode = currentAHNSelection && currentAHNSelection.isDifference
  $: currentAttribute = getIndicatorAttribute(indicator, indicator.attribute)

  // Check if AHN5 is selected (either as base year or compare year) - Nederland statistics not available for AHN5
  $: isAHN5Selected = currentAHNSelection && (currentAHNSelection.baseYear === 'AHN5' || currentAHNSelection.compareYear === 'AHN5')

  // MIGRATED: Calculate display values (unit-converted) and scale values (original %) separately
  // Force reactivity by reading $indicatorStore directly at the start
  $: medianValuesDict = (() => {
    // Read the indicator store to ensure Svelte tracks this dependency
    const storeValue = $indicatorStore
    const localIsDifferenceMode = storeValue && storeValue.isDifference
    // Use per-indicator BEB selection from store
    const bebSelection = storeValue?.beb || 'hele_buurt'

    // Nederland calculation - DISPLAY VALUES (weighted average when surface area specified)
    // Try cached values first, fall back to client-side calculation if needed
    let nederlandMedian = null;

    // In difference mode, always calculate client-side (cache doesn't store diff values for all combinations)
    if (!localIsDifferenceMode && $nederlandAggregates && $nederlandAggregates.aggregates) {
      let cached = $nederlandAggregates.aggregates[indicator.title];

      if (cached !== undefined) {
        // Check for BEB variants first
        if (cached && cached.hele_buurt !== undefined && cached.bebouwde_kom !== undefined) {
          // BEB indicator - get the correct variant using global BEB selection
          cached = cached[bebSelection];
        }

        // Now check if it's a year/AHN-based object or a simple value
        if (cached && typeof cached === 'object' && !Array.isArray(cached)) {
          // Multi-year or AHN indicator - get the value for the selected year/AHN
          const selectedYear = storeValue?.baseYear;
          if (selectedYear && cached[selectedYear] !== undefined) {
            nederlandMedian = cached[selectedYear];
          } else {
            // Check if any key matches an AHN pattern (fallback for indicators without explicit baseYear set yet)
            const ahnKeys = Object.keys(cached).filter(k => k.startsWith('AHN'));
            if (ahnKeys.length > 0 && !selectedYear) {
              // Default to first AHN version if no selection
              nederlandMedian = cached[ahnKeys[0]];
            }
          }
        } else if (cached !== undefined && (typeof cached !== 'object' || Array.isArray(cached))) {
          // Simple value or aggregated indicator classes
          nederlandMedian = cached;
        }
      }
    }

    // FALLBACK: If no cached value and we have all neighborhoods data, calculate client-side
    // This handles AHN version switches and other cases where cache doesn't have the exact variant
    if (nederlandMedian === null && $allNeighbourhoodsJSONData && $allNeighbourhoodsJSONData.features && storeValue) {

      if (localIsDifferenceMode) {
        nederlandMedian = calcMedian(
          $allNeighbourhoodsJSONData.features
            .map((neighbourhood) => getDifferenceValue(neighbourhood, indicator))
            .filter((value) => value !== null)
        )
      } else {
        // Use median for numerical indicators, average for aggregated indicators
        if (indicator.aggregatedIndicator) {
          nederlandMedian = calcAverage(
            $allNeighbourhoodsJSONData.features
              .map((neighbourhood) => getNumericalValue(neighbourhood, indicator))
              .filter((value) => value !== null)
          )
        } else {
          nederlandMedian = calcMedian(
            $allNeighbourhoodsJSONData.features
              .map((neighbourhood) => getNumericalValue(neighbourhood, indicator))
              .filter((value) => value !== null)
          )
        }
      }
    }

    // Municipality calculation - DISPLAY VALUES
    const gemeenteMedian = ($municipalitySelection !== null && $allNeighbourhoodsJSONData && $allNeighbourhoodsJSONData.features && storeValue) ? (() => {
      const municipalityFilter = $allNeighbourhoodsJSONData.features.filter(
        (neighbourhood) => neighbourhood?.properties && neighbourhood.properties[$municipalityCodeAbbreviation] === $municipalitySelection
      )
      return localIsDifferenceMode
        ? calcMedian(
            municipalityFilter
              .map((neighbourhood) => getDifferenceValue(neighbourhood, indicator))
              .filter((value) => value !== null)
          )
        : (() => {
            // Use median for numerical indicators, average for aggregated indicators
            if (indicator.aggregatedIndicator) {
              return calcAverage(
                municipalityFilter
                  .map((neighbourhood) => getNumericalValue(neighbourhood, indicator))
                  .filter((value) => value !== null)
              )
            } else {
              return calcMedian(
                municipalityFilter
                  .map((neighbourhood) => getNumericalValue(neighbourhood, indicator))
                  .filter((value) => value !== null)
              )
            }
          })()
    })() : 0
    
    // Neighborhood and district type calculations - DISPLAY VALUES (unit-converted)
    let buurtValue = 0
    let buurtRawValueForNoData = null // Store raw value to determine no-data reason
    let wijktypeMedian = 0

    if ($neighbourhoodSelection !== null && $allNeighbourhoodsJSONData && $allNeighbourhoodsJSONData.features && storeValue) {
      const neighbourhoodFilter = $allNeighbourhoodsJSONData.features.filter(
        (neighbourhood) => neighbourhood?.properties && neighbourhood.properties[$neighbourhoodCodeAbbreviation] === $neighbourhoodSelection
      )

      if (localIsDifferenceMode) {
        const diffValue = getDifferenceValue(neighbourhoodFilter[0], indicator)
        buurtValue = diffValue !== null ? Math.round(diffValue * 100) / 100 : "Geen data"

        wijktypeMedian = calcMedian(
          $districtTypeJSONData.features
            .map((neighbourhood) => getDifferenceValue(neighbourhood, indicator))
            .filter((value) => value !== null)
        )
      } else {
        const feature = neighbourhoodFilter[0]
        // Get raw value first to check no-data reason
        buurtRawValueForNoData = getRawValue(feature, indicator)
        let buurtNumericalValue = getNumericalValue(feature, indicator)

        buurtValue = buurtNumericalValue !== null
          ? Math.round(buurtNumericalValue * 100) / 100
          : "Geen data"

        wijktypeMedian = calcMedian(
          $districtTypeJSONData.features
            .map((neighbourhood) => getNumericalValue(neighbourhood, indicator))
            .filter((value) => value !== null)
        )
      }
    }

    const result = {
      medianValueNederland: nederlandMedian,
      medianValueGemeente: gemeenteMedian,
      medianValueBuurt: buurtValue,
      medianValueWijktype: wijktypeMedian,
      rawValueBuurt: buurtRawValueForNoData, // Pass raw value for no-data reason detection
    }
    return result
  })()
  
  // SCALE VALUES: Calculate using original percentage values for consistent positioning/colors
  $: scaleValuesDict = (() => {
    // Read the indicator store to ensure Svelte tracks this dependency
    const storeValue = $indicatorStore
    const localIsDifferenceMode = storeValue && storeValue.isDifference

    // Get the original attribute (always percentage, no unit conversion)
    const originalAttribute = getIndicatorAttribute(indicator, indicator.attribute)

    // Nederland scale calculation - ORIGINAL VALUES (weighted average when surface area specified)
    // Try cached values first, fall back to client-side calculation if needed
    let nederlandScale = null;

    // In difference mode, always calculate client-side (cache doesn't store diff values for all combinations)
    if (!localIsDifferenceMode && $nederlandAggregates && $nederlandAggregates.aggregates) {
      let cached = $nederlandAggregates.aggregates[indicator.title];

      if (cached !== undefined) {
        // Check for BEB variants first
        if (cached && cached.hele_buurt !== undefined && cached.bebouwde_kom !== undefined) {
          // BEB indicator - get the correct variant
          const bebSelection = storeValue?.beb || 'hele_buurt';
          cached = cached[bebSelection];
        }

        // Now check if it's a year/AHN-based object or a simple value
        if (cached && typeof cached === 'object' && !Array.isArray(cached)) {
          // Multi-year or AHN indicator - get the value for the selected year/AHN
          const selectedYear = storeValue?.baseYear;
          if (selectedYear && cached[selectedYear] !== undefined) {
            nederlandScale = cached[selectedYear];
          } else {
            // Check if any key matches an AHN pattern (fallback for indicators without explicit baseYear set yet)
            const ahnKeys = Object.keys(cached).filter(k => k.startsWith('AHN'));
            if (ahnKeys.length > 0 && !selectedYear) {
              // Default to first AHN version if no selection
              nederlandScale = cached[ahnKeys[0]];
            }
          }
        } else if (cached !== undefined && (typeof cached !== 'object' || Array.isArray(cached))) {
          // Simple value
          nederlandScale = cached;
        }
      }
    }

    // FALLBACK: Calculate client-side if no cached value (e.g., different AHN version)
    if (nederlandScale === null && $allNeighbourhoodsJSONData && $allNeighbourhoodsJSONData.features && storeValue) {
      if (localIsDifferenceMode) {
        nederlandScale = calcMedian(
          $allNeighbourhoodsJSONData.features
            .map((neighbourhood) => getDifferenceValue(neighbourhood, indicator))
            .filter((value) => value !== null)
        )
      } else {
        // Use median for numerical indicators, average for aggregated indicators
        if (indicator.aggregatedIndicator) {
          nederlandScale = calcAverage(
            $allNeighbourhoodsJSONData.features
              .map((neighbourhood) => getNumericalValue(neighbourhood, indicator))
              .filter((value) => value !== null)
          )
        } else {
          nederlandScale = calcMedian(
            $allNeighbourhoodsJSONData.features
              .map((neighbourhood) => getNumericalValue(neighbourhood, indicator))
              .filter((value) => value !== null)
          )
        }
      }
    }

    // Municipality scale calculation - ORIGINAL VALUES
    const gemeenteScale = ($municipalitySelection !== null && $allNeighbourhoodsJSONData && $allNeighbourhoodsJSONData.features && storeValue) ? (() => {
      const municipalityFilter = $allNeighbourhoodsJSONData.features.filter(
        (neighbourhood) => neighbourhood?.properties && neighbourhood.properties[$municipalityCodeAbbreviation] === $municipalitySelection
      )
      return localIsDifferenceMode
        ? calcMedian(
            municipalityFilter
              .map((neighbourhood) => getDifferenceValue(neighbourhood, indicator))
              .filter((value) => value !== null)
          )
        : (() => {
            // Use median for numerical indicators, average for aggregated indicators
            if (indicator.aggregatedIndicator) {
              return calcAverage(
                municipalityFilter
                  .map((neighbourhood) => getNumericalValue(neighbourhood, indicator))
                  .filter((value) => value !== null)
              )
            } else {
              return calcMedian(
                municipalityFilter
                  .map((neighbourhood) => getNumericalValue(neighbourhood, indicator))
                  .filter((value) => value !== null)
              )
            }
          })()
    })() : 0
    
    // Neighborhood and district type scale calculations - ORIGINAL VALUES (for positioning)
    let buurtScale = 0
    let wijktypeScale = 0

    if ($neighbourhoodSelection !== null && $allNeighbourhoodsJSONData && $allNeighbourhoodsJSONData.features && storeValue) {
      const neighbourhoodFilter = $allNeighbourhoodsJSONData.features.filter(
        (neighbourhood) => neighbourhood?.properties && neighbourhood.properties[$neighbourhoodCodeAbbreviation] === $neighbourhoodSelection
      )

      if (localIsDifferenceMode) {
        const diffValue = getDifferenceValue(neighbourhoodFilter[0], indicator)
        buurtScale = diffValue !== null ? diffValue : 0

        wijktypeScale = calcMedian(
          $districtTypeJSONData.features
            .map((neighbourhood) => getDifferenceValue(neighbourhood, indicator))
            .filter((value) => value !== null)
        )
      } else {
        const feature = neighbourhoodFilter[0]
        // Use getRawValue to handle Dordrecht's AHN underscore naming (e.g., "BKB_AHN3" vs "BKBAHN3")
        let buurtRawValue = getRawValue(feature, indicator)

        buurtScale = (buurtRawValue !== null && buurtRawValue !== "" && !isNaN(buurtRawValue))
          ? +buurtRawValue : 0

        wijktypeScale = calcMedian(
          $districtTypeJSONData.features
            // Use getRawValue to handle Dordrecht's AHN underscore naming
            .map((neighbourhood) => getRawValue(neighbourhood, indicator))
            .filter((value) => value !== null && value !== "" && !isNaN(value))
            .map((value) => +value)
        )
      }
    }
    
    const result = {
      medianValueNederland: nederlandScale,
      medianValueGemeente: gemeenteScale,
      medianValueBuurt: buurtScale,
      medianValueWijktype: wijktypeScale,
    }
    return result
  })()

  // This is used for showing comparison values
  let medianValuesDictOtherYear = {
    medianValueNederland: 0,
    medianValueGemeente: 0,
    medianValueBuurt: 0,
    medianValueWijktype: 0,
  }

  // NOTE: All median calculations are now handled in the single comprehensive reactive statement above

  // Declare variables for scale
  let xScaleMin = 0
  let xDomain = [0, 100]

  // Calculate min and max values for the scale using SCALE VALUES (original %) for consistent positioning
  $: {
    // Use scale values (original percentages) for consistent bar positioning
    const numericValues = [
      scaleValuesDict["medianValueNederland"],
      scaleValuesDict["medianValueGemeente"],
      scaleValuesDict["medianValueBuurt"],
      scaleValuesDict["medianValueWijktype"],
    ].filter((val) => typeof val === "number" && !isNaN(val))

    // Calculate min and max based on original percentage values
    let minValue = min(numericValues)
    let maxValue = max(numericValues)
    
    // Fallback to safe defaults if no valid values
    if (isNaN(minValue) || minValue === undefined) minValue = 0
    if (isNaN(maxValue) || maxValue === undefined) maxValue = 100
    
    // Ensure we have valid numbers
    minValue = Number(minValue) || 0
    maxValue = Number(maxValue) || 100

    // For difference mode, we need a diverging scale that includes zero
    if (isDifferenceMode) {
      // Add some padding to the scale
      const padding = Math.max(Math.abs(minValue), Math.abs(maxValue)) * 0.1
      xScaleMin = minValue < 0 ? minValue - padding : -1 // Ensure negative values are shown
      xDomain = [xScaleMin, maxValue + padding]
    } else {
      // For regular mode, start at 0
      xScaleMin = minValue < 0 ? minValue - 1 : 0
      xDomain = [xScaleMin, maxValue * 1.1] // Add 10% padding
    }
    
    // Validate domain values
    if (isNaN(xDomain[0]) || isNaN(xDomain[1])) {
      xDomain = [0, 100] // Fallback to safe domain
    }
  }

  $: xScaleStats = scaleLinear()
    .domain(xDomain)
    .range(
      isDifferenceMode
        ? [30, statsWidth - 300] // More space on left for difference mode
        : [0, statsWidth - 240],
    )
</script>

<div
  class="indicator-stats"
  style="height: {bodyHeight * 0.2 * 0.25}px; {$configStore && $configStore.dashboardTitle === 'Buurtdashboard Dordrecht'
    ? 'visibility: hidden;'
    : ''}"
  bind:clientWidth={statsWidth}
>
  {#if isAHN5Selected && indicator.AHNversie}
    <div class="ahn5-notice">
      <span class="region-label">Nederland</span>
      <span class="notice-text">Niet voor heel Nederland beschikbaar</span>
    </div>
  {:else}
    <Stat
      {indicatorValueColorscale}
      {indicator}
      medianValueOtherYear={medianValuesDictOtherYear["medianValueNederland"]}
      graphWidth={statsWidth}
      indicatorHeight={bodyHeight * 0.2 * 0.25}
      regio="Nederland"
      medianValue={medianValuesDict["medianValueNederland"]}
      scaleValue={scaleValuesDict["medianValueNederland"]}
      {xScaleStats}
    />
  {/if}
</div>
<div class="indicator-stats" style="height: {bodyHeight * 0.2 * 0.25}px">
  {#if $municipalitySelection !== null}
    <Stat
      {indicatorValueColorscale}
      {indicator}
      medianValueOtherYear={medianValuesDictOtherYear["medianValueGemeente"]}
      graphWidth={statsWidth}
      indicatorHeight={bodyHeight * 0.2 * 0.25}
      regio="Gemeente"
      medianValue={medianValuesDict["medianValueGemeente"]}
      scaleValue={scaleValuesDict["medianValueGemeente"]}
      {xScaleStats}
    />
  {/if}
</div>
<div class="indicator-stats" style="height: {bodyHeight * 0.2 * 0.25}px">
  {#if $neighbourhoodSelection !== null}
    <Stat
      {indicatorValueColorscale}
      {indicator}
      medianValueOtherYear={medianValuesDictOtherYear["medianValueBuurt"]}
      graphWidth={statsWidth}
      indicatorHeight={bodyHeight * 0.2 * 0.25}
      regio="Buurt"
      medianValue={medianValuesDict["medianValueBuurt"]}
      scaleValue={scaleValuesDict["medianValueBuurt"]}
      rawValue={medianValuesDict["rawValueBuurt"]}
      {xScaleStats}
    />
  {/if}
</div>
<div class="indicator-stats" style="height: {bodyHeight * 0.2 * 0.25}px">
  {#if $neighbourhoodSelection !== null && $selectedNeighbourhoodJSONData && $selectedNeighbourhoodJSONData.properties[$districtTypeAbbreviation]}
    <Stat
      {indicatorValueColorscale}
      {indicator}
      medianValueOtherYear={medianValuesDictOtherYear["medianValueWijktype"]}
      graphWidth={statsWidth}
      indicatorHeight={bodyHeight * 0.2 * 0.25}
      regio="Wijktype"
      medianValue={medianValuesDict["medianValueWijktype"]}
      scaleValue={scaleValuesDict["medianValueWijktype"]}
      {xScaleStats}
    />
  {/if}
</div>

<style>
  .ahn5-notice {
    display: flex;
    align-items: center;
    height: 100%;
    padding: 0 10px;
    gap: 10px;
  }

  .region-label {
    min-width: 165px;
    text-align: right;
    font-size: 13px;
    color: #645f5e;
  }

  .notice-text {
    font-size: 11px;
    color: #888;
    font-style: italic;
  }
</style>
