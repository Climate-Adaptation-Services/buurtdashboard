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
    AHNSelecties,
    configStore,
  } from "$lib/stores"
  import Stat from "./Stat.svelte"
  import { scaleLinear, min, max } from "d3"
  import { calcMedian } from "$lib/noncomponents/calcMedian"
  import { getIndicatorAttribute } from "$lib/noncomponents/getIndicatorAttribute"

  export let bodyHeight
  export let indicator
  export let indicatorValueColorscale

  let statsWidth

  // Create reactive variables that update when AHNSelecties changes
  $: currentAHNSelection = $AHNSelecties[indicator.title]
  $: isDifferenceMode = currentAHNSelection && typeof currentAHNSelection === "object" && currentAHNSelection.isDifference

  // Variables to store attribute names
  let baseAttribute, compareAttribute

  // Get the appropriate attributes based on whether we're in difference mode
  $: {
    if (isDifferenceMode) {
      // For difference mode, we need to construct the attribute names correctly
      // The attribute name format is typically: baseAttributeAHN2, baseAttributeAHN4, etc.
      baseAttribute = indicator.attribute + currentAHNSelection.baseYear
      compareAttribute = indicator.attribute + currentAHNSelection.compareYear
    } else {
      // For regular mode, just use the current selection
      baseAttribute = getIndicatorAttribute(indicator, indicator.attribute)
      compareAttribute = null
    }
  }

  // Calculate median values based on the current mode (regular or difference)
  $: medianValuesDict = {
    medianValueNederland: isDifferenceMode
      ? calcMedian(
          $allNeighbourhoodsJSONData.features.map((neighbourhood) => {
            // Get values for both years
            const baseValue = +neighbourhood.properties[baseAttribute] || 0
            const compareValue = +neighbourhood.properties[compareAttribute] || 0
            const diff = compareValue - baseValue
            return diff
          }),
        )
      : calcMedian($allNeighbourhoodsJSONData.features.map((neighbourhood) => +neighbourhood.properties[baseAttribute])),
    medianValueGemeente: 0,
    medianValueBuurt: 0,
    medianValueWijktype: 0,
  }

  // This is used for showing comparison values
  let medianValuesDictOtherYear = {
    medianValueNederland: 0,
    medianValueGemeente: 0,
    medianValueBuurt: 0,
    medianValueWijktype: 0,
  }

  $: if ($municipalitySelection !== null) {
    // Neighbourhoods binnen municipality
    const municipalityFilter = $allNeighbourhoodsJSONData.features.filter(
      (neighbourhood) => neighbourhood.properties[$municipalityCodeAbbreviation] === $municipalitySelection,
    )

    medianValuesDict["medianValueGemeente"] = isDifferenceMode
      ? calcMedian(
          municipalityFilter.map((neighbourhood) => {
            // Get values for both years
            const baseValue = +neighbourhood.properties[baseAttribute] || 0
            const compareValue = +neighbourhood.properties[compareAttribute] || 0
            const diff = compareValue - baseValue
            return diff
          }),
        )
      : calcMedian(municipalityFilter.map((neighbourhood) => +neighbourhood.properties[baseAttribute]))
  } else {
    medianValuesDict["medianValueGemeente"] = 0
  }

  $: if ($neighbourhoodSelection !== null && currentAHNSelection) {
    // deze filter is 1 neighbourhood
    const neighbourhoodFilter = $allNeighbourhoodsJSONData.features.filter(
      (neighbourhood) => neighbourhood.properties[$neighbourhoodCodeAbbreviation] === $neighbourhoodSelection,
    )

    if (isDifferenceMode) {
      // Calculate difference for the selected neighborhood
      const baseValue = +neighbourhoodFilter[0].properties[baseAttribute] || 0
      const compareValue = +neighbourhoodFilter[0].properties[compareAttribute] || 0
      const diffValue = compareValue - baseValue

      medianValuesDict["medianValueBuurt"] = !isNaN(diffValue) ? Math.round(diffValue * 100) / 100 : "Geen data"

      // Calculate difference for the district type
      medianValuesDict["medianValueWijktype"] = calcMedian(
        $districtTypeJSONData.features.map((neighbourhood) => {
          const baseVal = +neighbourhood.properties[baseAttribute] || 0
          const compareVal = +neighbourhood.properties[compareAttribute] || 0
          const diff = compareVal - baseVal
          return diff
        }),
      )
    } else {
      // Regular mode - show single value
      medianValuesDict["medianValueBuurt"] =
        neighbourhoodFilter[0].properties[baseAttribute] !== null
          ? Math.round(neighbourhoodFilter[0].properties[baseAttribute] * 100) / 100
          : "Geen data"

      medianValuesDict["medianValueWijktype"] = calcMedian(
        $districtTypeJSONData.features.map((neighbourhood) => neighbourhood.properties[baseAttribute]),
      )
    }
  } else {
    medianValuesDict["medianValueBuurt"] = 0
    medianValuesDict["medianValueWijktype"] = 0
    medianValuesDictOtherYear["medianValueBuurt"] = 0
    medianValuesDictOtherYear["medianValueWijktype"] = 0
  }

  // Declare variables for scale
  let xScaleMin = 0
  let xDomain = [0, 100]

  // Calculate min and max values for the scale
  $: {
    // Filter out non-numeric values
    const numericValues = [
      medianValuesDict["medianValueNederland"],
      medianValuesDict["medianValueGemeente"],
      medianValuesDict["medianValueBuurt"],
      medianValuesDict["medianValueWijktype"],
    ].filter((val) => typeof val === "number")

    // Calculate min and max
    const minValue = min(numericValues)
    const maxValue = max(numericValues)

    // For difference mode, we need a diverging scale that includes zero
    if (isDifferenceMode) {
      // Add some padding to the scale
      const padding = Math.max(Math.abs(minValue || 0), Math.abs(maxValue || 0)) * 0.1
      xScaleMin = minValue < 0 ? minValue - padding : -1 // Ensure negative values are shown
      xDomain = [xScaleMin, maxValue + padding]
    } else {
      // For regular mode, start at 0
      xScaleMin = minValue < 0 ? minValue - 1 : 0
      xDomain = [xScaleMin, maxValue * 1.1] // Add 10% padding
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

<div class="indicator-stats" style="height: {bodyHeight * 0.2 * 0.25}px; {$configStore && $configStore.dashboardTitle === 'Buurtdashboard Dordrecht' ? 'visibility: hidden;' : ''}" bind:clientWidth={statsWidth}>
  <Stat
    {indicatorValueColorscale}
    {indicator}
    medianValueOtherYear={medianValuesDictOtherYear["medianValueNederland"]}
    graphWidth={statsWidth}
    indicatorHeight={bodyHeight * 0.2 * 0.25}
    regio="Nederland"
    medianValue={medianValuesDict["medianValueNederland"]}
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
        {xScaleStats}
      />
    </div>
  {/if}
{/if}

<style>
</style>
