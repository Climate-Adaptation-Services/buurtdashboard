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
  import * as _ from "lodash"
  import { scaleLinear, max, min } from "d3"
  import { t } from "$lib/i18n/translate.js"
  import { calcMedian } from "$lib/noncomponents/calcMedian"
  import { getIndicatorAttribute } from "$lib/noncomponents/getIndicatorAttribute"

  export let bodyHeight
  export let indicator
  export let indicatorValueColorscale

  // $: isThereOtherYear = $alleIndicatoren2019.map((d) => d.title).includes(indicator.title) && $AHNSelecties[indicator.title] !== "Difference"

  let statsWidth

  $: medianValuesDict = {
    medianValueNederland: calcMedian($allNeighbourhoodsJSONData.features.map((neighbourhood) => +neighbourhood.properties[indicatorAttribute])),
    medianValueGemeente: 0,
    medianValueBuurt: 0,
    medianValueWijktype: 0,
  }

  $: otherYear = $AHNSelecties[indicator.title] === "2019" ? "2023" : "2019"
  $: attributeYearSliced = getIndicatorAttribute(indicator, indicator.attribute).slice(0, -4)
  $: otherYearAttribute = attributeYearSliced + otherYear
  $: indicatorAttribute =
    $AHNSelecties[indicator.title] === "Difference" ? attributeYearSliced + "Difference" : getIndicatorAttribute(indicator, indicator.attribute)

  let medianValuesDictOtherYear = {
    medianValueNederland: 0,
    medianValueGemeente: 0,
    medianValueBuurt: 0,
    medianValueWijktype: 0,
  }
  // $: if (isThereOtherYear) {
  //   medianValuesDictOtherYear["medianValueNederland"] = calcMedian(
  //     $allNeighbourhoodsJSONData.features.map((neighbourhood) => neighbourhood.properties[otherYearAttribute]),
  //   )
  // }

  $: if ($municipalitySelection !== null) {
    // Neighbourhoods binnen municipality
    const municipalityFilter = $allNeighbourhoodsJSONData.features.filter(
      (neighbourhood) => neighbourhood.properties[$municipalityCodeAbbreviation] === $municipalitySelection,
    )
    medianValuesDict["medianValueGemeente"] = calcMedian(municipalityFilter.map((neighbourhood) => neighbourhood.properties[indicatorAttribute]))
    // if (isThereOtherYear) {
    //   medianValuesDictOtherYear["medianValueGemeente"] = calcMedian(
    //     municipalityFilter.map((neighbourhood) => neighbourhood.properties[otherYearAttribute]),
    //   )
    // }
  } else {
    medianValuesDict["medianValueGemeente"] = 0
    // if (isThereOtherYear) {
    //   medianValuesDictOtherYear["medianValueGemeente"] = 0
    // }
  }

  $: if ($neighbourhoodSelection !== null) {
    // deze filter is 1 neighbourhood
    const neighbourhoodFilter = $allNeighbourhoodsJSONData.features.filter(
      (neighbourhood) => neighbourhood.properties[$neighbourhoodCodeAbbreviation] === $neighbourhoodSelection,
    )
    medianValuesDict["medianValueBuurt"] =
      neighbourhoodFilter[0].properties[indicatorAttribute] !== null
        ? Math.round(neighbourhoodFilter[0].properties[indicatorAttribute] * 100) / 100
        : "Geen data"

    // if (isThereOtherYear) {
    //   medianValuesDictOtherYear["medianValueBuurt"] =
    //     neighbourhoodFilter[0].properties[otherYearAttribute] !== null
    //       ? Math.round(neighbourhoodFilter[0].properties[otherYearAttribute] * 100) / 100
    //       : "Geen data"
    // }

    medianValuesDict["medianValueWijktype"] = calcMedian(
      $districtTypeJSONData.features.map((neighbourhood) => neighbourhood.properties[indicatorAttribute]),
    )
    // if (isThereOtherYear) {
    //   medianValuesDictOtherYear["medianValueWijktype"] = calcMedian(
    //     $districtTypeJSONData.features.map((neighbourhood) => neighbourhood.properties[otherYearAttribute]),
    //   )
    // }
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
    // if (indicator.title !== t("Grondwaterstand 2050 hoog")) {
    //   if ($AHNSelecties[indicator.title] === "Difference") {
    //     xDomain = [min(medianValues) - 10, max(medianValues)]
    //   } else {
    //     if ($alleIndicatoren2019.map((d) => d.title).includes(indicator.title)) {
    //       medianValues = [
    //         ...medianValues,
    //         medianValuesDictOtherYear["medianValueNederland"],
    //         medianValuesDictOtherYear["medianValueGemeente"],
    //         medianValuesDictOtherYear["medianValueBuurt"],
    //         medianValuesDictOtherYear["medianValueWijktype"],
    //       ]
    //     }
    //     xDomain = [0, max(medianValues)]
    //   }
    // } else {
    xDomain = [0, min(medianValues)]
    // }
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
