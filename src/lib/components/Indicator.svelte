<script>
  import { municipalitySelection, neighbourhoodsInMunicipalityJSONData, AHNSelecties } from "$lib/stores"
  import { scaleLinear, extent, scaleOrdinal } from "d3"
  import IndicatorInfo from "./IndicatorInfo.svelte"
  import IndicatorTitle from "./IndicatorTitle.svelte"
  import IndicatorBody from "./IndicatorBody.svelte"
  import { getIndicatorAttribute } from "$lib/noncomponents/getIndicatorAttribute"

  export let indicatorHeight
  export let indicator

  let graphWidth
  const titleHeight = indicatorHeight * 0.23
  const bodyHeight = indicatorHeight * 0.77

  let indicatorValueColorscale = null

  // this code block is to set the colorscale
  $: {
    if (indicator.numerical) {
      if ($municipalitySelection !== null) {
        let rangeExtent = [0, 1] // default value [0,1]
        rangeExtent = extent(
          $neighbourhoodsInMunicipalityJSONData.features,
          (d) => +d.properties[getIndicatorAttribute(indicator, indicator.attribute)],
        )
        // this can deal with any amount of colors in the scale
        const step = (rangeExtent[1] - rangeExtent[0]) / (indicator.color.range.length - 1)

        // Check if we're in difference mode
        const ahnSelection = $AHNSelecties[indicator.title]
        const isDifferenceMode = ahnSelection && typeof ahnSelection === "object" && ahnSelection.isDifference

        // if looking at difference between years
        if (isDifferenceMode) {
          // Create a diverging color scale for difference values
          // Using purple for positive values and orange for negative values
          indicatorValueColorscale = scaleLinear().domain([-10, -5, 0, 10, 20]).range(["black", "#D73027", "#cccccc", "green", "black"])
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
</script>

<div class="indicator-div">
  <IndicatorInfo {indicator} {graphWidth} />
  <IndicatorTitle {indicator} {titleHeight} />
  <IndicatorBody {indicator} {graphWidth} {bodyHeight} {indicatorValueColorscale} />
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
