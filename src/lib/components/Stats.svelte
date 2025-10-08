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
    configStore,
  } from "$lib/stores"
  import Stat from "./Stat.svelte"
  import { scaleLinear, min, max } from "d3"
  import { calcMedian, calcWeightedAverage } from "$lib/utils/calcMedian"
  // MIGRATED: Import centralized value retrieval functions
  import { getNumericalValue, getDifferenceValue, getIndicatorAttribute, toNumber, isValidValue } from "$lib/utils/valueRetrieval.js"

  export let bodyHeight
  export let indicator
  export let indicatorValueColorscale

  let statsWidth

  // MIGRATED: Use centralized AHN selection handling with reactive store dependency
  $: indicatorStore = getIndicatorStore(indicator.title)
  $: currentAHNSelection = $indicatorStore
  $: isDifferenceMode = currentAHNSelection && currentAHNSelection.isDifference

  // MIGRATED: Make attribute calculation reactive to store changes
  $: currentAttribute = getIndicatorAttribute(indicator, indicator.attribute)

  // MIGRATED: Calculate display values (unit-converted) and scale values (original %) separately
  $: medianValuesDict = currentAHNSelection && (() => {
    // Nederland calculation - DISPLAY VALUES (unit-converted)
    const nederlandMedian = isDifferenceMode
      ? calcMedian(
          $allNeighbourhoodsJSONData.features
            .map((neighbourhood) => getDifferenceValue(neighbourhood, indicator))
            .filter((value) => value !== null)
        )
      : (() => {
          // Use weighted average if surface area is specified, otherwise use median
          if (indicator.surfaceArea) {
            return calcWeightedAverage(
              $allNeighbourhoodsJSONData.features,
              (neighbourhood) => getNumericalValue(neighbourhood, indicator),
              indicator.surfaceArea,
              indicator
            )
          } else {
            const values = $allNeighbourhoodsJSONData.features
              .map((neighbourhood) => getNumericalValue(neighbourhood, indicator))
              .filter((value) => value !== null)
            return calcMedian(values)
          }
        })()

    // Municipality calculation - DISPLAY VALUES (unit-converted)
    const gemeenteMedian = $municipalitySelection !== null ? (() => {
      const municipalityFilter = $allNeighbourhoodsJSONData.features.filter(
        (neighbourhood) => neighbourhood.properties[$municipalityCodeAbbreviation] === $municipalitySelection
      )
      return isDifferenceMode
        ? calcMedian(
            municipalityFilter
              .map((neighbourhood) => getDifferenceValue(neighbourhood, indicator))
              .filter((value) => value !== null)
          )
        : (() => {
            // Use weighted average if surface area is specified, otherwise use median
            if (indicator.surfaceArea) {
              return calcWeightedAverage(
                municipalityFilter,
                (neighbourhood) => getNumericalValue(neighbourhood, indicator),
                indicator.surfaceArea,
                indicator
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
    let wijktypeMedian = 0
    
    if ($neighbourhoodSelection !== null && currentAHNSelection) {
      const neighbourhoodFilter = $allNeighbourhoodsJSONData.features.filter(
        (neighbourhood) => neighbourhood.properties[$neighbourhoodCodeAbbreviation] === $neighbourhoodSelection
      )
      
      if (isDifferenceMode) {
        const diffValue = getDifferenceValue(neighbourhoodFilter[0], indicator)
        buurtValue = diffValue !== null ? Math.round(diffValue * 100) / 100 : "Geen data"
        
        wijktypeMedian = calcMedian(
          $districtTypeJSONData.features
            .map((neighbourhood) => getDifferenceValue(neighbourhood, indicator))
            .filter((value) => value !== null)
        )
      } else {
        const feature = neighbourhoodFilter[0]
        const buurtRawValue = getNumericalValue(feature, indicator)
        buurtValue = buurtRawValue !== null
          ? Math.round(buurtRawValue * 100) / 100
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
    }
    return result
  })()
  
  // SCALE VALUES: Calculate using original percentage values for consistent positioning/colors
  $: scaleValuesDict = currentAHNSelection && (() => {
    // Get the original attribute (always percentage, no unit conversion)
    const originalAttribute = getIndicatorAttribute(indicator, indicator.attribute)

    // Nederland scale calculation - ORIGINAL VALUES (for positioning)
    const nederlandScale = isDifferenceMode
      ? calcMedian(
          $allNeighbourhoodsJSONData.features
            .map((neighbourhood) => getDifferenceValue(neighbourhood, indicator))
            .filter((value) => value !== null)
        )
      : (() => {
          // Use weighted average if surface area is specified, otherwise use median
          if (indicator.surfaceArea) {
            return calcWeightedAverage(
              $allNeighbourhoodsJSONData.features,
              (neighbourhood) => getNumericalValue(neighbourhood, indicator),
              indicator.surfaceArea,
              indicator
            )
          } else {
            const values = $allNeighbourhoodsJSONData.features
              .map((neighbourhood) => getNumericalValue(neighbourhood, indicator))
              .filter((value) => value !== null)
            return calcMedian(values)
          }
        })()

    // Municipality scale calculation - ORIGINAL VALUES (for positioning)
    const gemeenteScale = $municipalitySelection !== null ? (() => {
      const municipalityFilter = $allNeighbourhoodsJSONData.features.filter(
        (neighbourhood) => neighbourhood.properties[$municipalityCodeAbbreviation] === $municipalitySelection
      )
      return isDifferenceMode
        ? calcMedian(
            municipalityFilter
              .map((neighbourhood) => getDifferenceValue(neighbourhood, indicator))
              .filter((value) => value !== null)
          )
        : (() => {
            // Use weighted average if surface area is specified, otherwise use median
            if (indicator.surfaceArea) {
              return calcWeightedAverage(
                municipalityFilter,
                (neighbourhood) => getNumericalValue(neighbourhood, indicator),
                indicator.surfaceArea,
                indicator
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
    
    if ($neighbourhoodSelection !== null && currentAHNSelection) {
      const neighbourhoodFilter = $allNeighbourhoodsJSONData.features.filter(
        (neighbourhood) => neighbourhood.properties[$neighbourhoodCodeAbbreviation] === $neighbourhoodSelection
      )
      
      if (isDifferenceMode) {
        const diffValue = getDifferenceValue(neighbourhoodFilter[0], indicator)
        buurtScale = diffValue !== null ? diffValue : 0
        
        wijktypeScale = calcMedian(
          $districtTypeJSONData.features
            .map((neighbourhood) => getDifferenceValue(neighbourhood, indicator))
            .filter((value) => value !== null)
        )
      } else {
        const feature = neighbourhoodFilter[0]
        const buurtRawValue = feature.properties[originalAttribute]
        buurtScale = (buurtRawValue !== null && buurtRawValue !== "" && !isNaN(buurtRawValue)) 
          ? +buurtRawValue : 0
        
        wijktypeScale = calcMedian(
          $districtTypeJSONData.features
            .map((neighbourhood) => neighbourhood.properties[originalAttribute])
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
</div>
{#if $municipalitySelection !== null}
  <div class="indicator-stats" style="height: {bodyHeight * 0.2 * 0.25}px">
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
  </div>
{/if}
{#if $neighbourhoodSelection !== null}
  <div class="indicator-stats" style="height: {bodyHeight * 0.2 * 0.25}px">
    <Stat
      {indicatorValueColorscale}
      {indicator}
      medianValueOtherYear={medianValuesDictOtherYear["medianValueBuurt"]}
      graphWidth={statsWidth}
      indicatorHeight={bodyHeight * 0.2 * 0.25}
      regio="Buurt"
      medianValue={medianValuesDict["medianValueBuurt"]}
      scaleValue={scaleValuesDict["medianValueBuurt"]}
      {xScaleStats}
    />
  </div>
  {#if $selectedNeighbourhoodJSONData.properties[$districtTypeAbbreviation]}
    <div class="indicator-stats" style="height: {bodyHeight * 0.2 * 0.25}px">
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
    </div>
  {/if}
{/if}

<style>
</style>
