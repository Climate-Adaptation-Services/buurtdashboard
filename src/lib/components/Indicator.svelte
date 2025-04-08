<script>
  import {
    municipalitySelection,
    neighbourhoodsInMunicipalityJSONData,
    alleIndicatoren2019,
    alleIndicatoren2023,
    jaarSelecties,
  } from "$lib/stores"
  import { scaleLinear, extent, scaleOrdinal } from "d3"
  import { afterUpdate } from "svelte"
  import IndicatorInfo from "./IndicatorInfo.svelte"
  import IndicatorTitle from "./IndicatorTitle.svelte"
  import IndicatorBody from "./IndicatorBody.svelte"

  export let indicatorHeight
  export let indicator

  // deal with multiple years
  $: {
    if ($jaarSelecties[indicator.title] === "2019") {
      indicator = $alleIndicatoren2019.filter((ind) => ind.title === indicator.title)[0]
    } else {
      indicator = $alleIndicatoren2023.filter((ind) => ind.title === indicator.title)[0]
    }
  }

  let graphWidth

  const titleHeight = indicatorHeight * 0.23
  const bodyHeight = indicatorHeight * 0.77

  let indicatorValueColorscale = null

  // this code block is to set the colorscale
  $: {
    if (indicator.numerical) {
      if ($municipalitySelection !== null) {
        let rangeExtent = [0, 1] // default value [0,1]
        rangeExtent = extent($neighbourhoodsInMunicipalityJSONData.features, (d) => +d.properties[indicator.attribute])
        // this can deal with any amount of colors in the scale
        const step = (rangeExtent[1] - rangeExtent[0]) / (indicator.color.range.length - 1)

        // if looking at difference between years
        if ($jaarSelecties[indicator.title] === "Difference") {
          indicatorValueColorscale = scaleLinear().domain([-10, 0, 20]).range(["orange", "lightgrey", "purple"])
        } else {
          indicatorValueColorscale = scaleLinear()
            .domain([...Array(indicator.color.range.length).keys()].map((i) => rangeExtent[0] + i * step))
            .range(indicator.color.range)
        }
      }
    } else {
      indicatorValueColorscale = scaleOrdinal().domain(indicator.color.domain).range(indicator.color.range)
    }
  }

  $: indicatorPlottitle = $jaarSelecties[indicator.title] === "Difference" ? indicator.plottitle.replace("%", "% verandering") : indicator.plottitle
</script>

<div class="indicator-div">
  <IndicatorInfo {indicator} {graphWidth} />
  <IndicatorTitle {indicator} {titleHeight} />
  <IndicatorBody {indicator} {bodyHeight} {indicatorValueColorscale} {indicatorPlottitle} />
</div>

<style>
  .indicator-div {
    height: 100%;
    display: flex;
    flex-direction: column;
    box-shadow: rgba(0, 0, 0, 0.24) 0px 3px 8px;
    position: relative;
  }
</style>
