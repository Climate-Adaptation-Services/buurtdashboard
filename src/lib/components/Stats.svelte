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
  } from "$lib/stores"
  import Stat from "./Stat.svelte"
  import { scaleLinear, min, max } from "d3"
  import { calcMedian } from "$lib/noncomponents/calcMedian"
  import { getIndicatorAttribute } from "$lib/noncomponents/getIndicatorAttribute"

  export let bodyHeight
  export let indicator
  export let indicatorValueColorscale

  let statsWidth

  // Create a reactive variable that updates when AHNSelecties changes
  $: currentAHNSelection = $AHNSelecties[indicator.title];

  // Make medianValuesDict reactive to AHNSelecties changes
  $: medianValuesDict = {
    medianValueNederland: calcMedian(
      $allNeighbourhoodsJSONData.features.map((neighbourhood) => +neighbourhood.properties[getIndicatorAttribute(indicator, indicator.attribute)]),
    ),
    medianValueGemeente: 0,
    medianValueBuurt: 0,
    medianValueWijktype: 0,
  }

  let medianValuesDictOtherYear = {
    medianValueNederland: 0,
    medianValueGemeente: 0,
    medianValueBuurt: 0,
    medianValueWijktype: 0,
  }

  $: if ($municipalitySelection !== null && currentAHNSelection) {
    // Neighbourhoods binnen municipality
    const municipalityFilter = $allNeighbourhoodsJSONData.features.filter(
      (neighbourhood) => neighbourhood.properties[$municipalityCodeAbbreviation] === $municipalitySelection,
    )
    medianValuesDict["medianValueGemeente"] = calcMedian(
      municipalityFilter.map((neighbourhood) => neighbourhood.properties[getIndicatorAttribute(indicator, indicator.attribute)]),
    )
  } else {
    medianValuesDict["medianValueGemeente"] = 0
  }

  $: if ($neighbourhoodSelection !== null && currentAHNSelection) {
    // deze filter is 1 neighbourhood
    const neighbourhoodFilter = $allNeighbourhoodsJSONData.features.filter(
      (neighbourhood) => neighbourhood.properties[$neighbourhoodCodeAbbreviation] === $neighbourhoodSelection,
    )
    medianValuesDict["medianValueBuurt"] =
      neighbourhoodFilter[0].properties[getIndicatorAttribute(indicator, indicator.attribute)] !== null
        ? Math.round(neighbourhoodFilter[0].properties[getIndicatorAttribute(indicator, indicator.attribute)] * 100) / 100
        : "Geen data"

    medianValuesDict["medianValueWijktype"] = calcMedian(
      $districtTypeJSONData.features.map((neighbourhood) => neighbourhood.properties[getIndicatorAttribute(indicator, indicator.attribute)]),
    )
  } else {
    medianValuesDict["medianValueBuurt"] = 0
    medianValuesDict["medianValueWijktype"] = 0
    medianValuesDictOtherYear["medianValueBuurt"] = 0
    medianValuesDictOtherYear["medianValueWijktype"] = 0
  }

  $: xScaleMin = min([
    0,
    medianValuesDict["medianValueNederland"],
    medianValuesDict["medianValueGemeente"],
    medianValuesDict["medianValueBuurt"],
    medianValuesDict["medianValueWijktype"],
  ])
  // grondwater hoog kan negatief zijn, en de schaal moet wat opgerekt
  if (xScaleMin < 0) {
    xScaleMin -= 10
  }

  let xDomain
  $: {
    let medianValues = [
      medianValuesDict["medianValueNederland"],
      medianValuesDict["medianValueGemeente"],
      medianValuesDict["medianValueBuurt"],
      medianValuesDict["medianValueWijktype"],
    ]
    xDomain = [0, max(medianValues)]
  }

  $: xScaleStats = scaleLinear()
    .domain(xDomain)
    .range([0, statsWidth - 240])
</script>

<div class="indicator-stats" style="height: {bodyHeight * 0.2 * 0.25}px" bind:clientWidth={statsWidth}>
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
