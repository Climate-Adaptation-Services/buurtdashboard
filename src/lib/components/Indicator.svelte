<script>
  import { municipalitySelection, neighbourhoodsInMunicipalityJSONData, getIndicatorStore } from "$lib/stores"
  import { scaleLinear, extent, scaleOrdinal } from "d3"
  import IndicatorInfo from "./IndicatorInfo.svelte"
  import IndicatorTitle from "./IndicatorTitle.svelte"
  import IndicatorBody from "./IndicatorBody.svelte"
  import { getIndicatorAttribute } from "$lib/noncomponents/getIndicatorAttribute"

  export let indicatorHeight
  export let indicator

  // Get the dedicated store for this specific indicator - naturally isolated!
  const indicatorStore = getIndicatorStore(indicator.title)



  let graphWidth
  const titleHeight = indicatorHeight * 0.23
  const bodyHeight = indicatorHeight * 0.77

  // Initialize with a default color scale to prevent null errors
  let indicatorValueColorscale = (value) => "#cccccc"

  // MEMOIZED: Create color scale only when specific indicator data changes
  let colorScaleMemoKey = ""
  $: {
    if (indicator && $municipalitySelection && $neighbourhoodsInMunicipalityJSONData) {
      // Create a memoization key based only on data that affects THIS indicator's color scale
      const indicatorAttribute = getIndicatorAttribute(indicator, indicator.attribute)
      const ahnSelection = $indicatorStore || {}
      const isDifferenceMode = ahnSelection && typeof ahnSelection === "object" && ahnSelection.isDifference

      // Create key from only the data that matters for this indicator's color scale
      const newMemoKey = JSON.stringify({
        indicatorTitle: indicator.title,
        indicatorAttribute,
        isDifferenceMode,
        municipalitySelection: $municipalitySelection,
        // Only include the actual data values for this indicator, not the entire store reference
        dataValues: $neighbourhoodsInMunicipalityJSONData?.features?.map((d) => d.properties[indicatorAttribute]).sort(),
      })

      // Only recreate color scale if the key actually changed
      if (newMemoKey !== colorScaleMemoKey) {
        colorScaleMemoKey = newMemoKey


        if (indicator.numerical) {
          if ($municipalitySelection !== null) {
            // Always use base attribute (% values) for consistent color scale
            const indicatorAttribute = getIndicatorAttribute(indicator, indicator.attribute)

            let rangeExtent = [0, 1] // default value [0,1]
            rangeExtent = extent($neighbourhoodsInMunicipalityJSONData.features, (d) => +d.properties[indicatorAttribute])

            // this can deal with any amount of colors in the scale
            const step = (rangeExtent[1] - rangeExtent[0]) / (indicator.color.range.length - 1)

            // Check if we're in difference mode (use derived store to prevent unnecessary recreations)
            const ahnSelection = $indicatorStore || {}
            const isDifferenceMode = ahnSelection && typeof ahnSelection === "object" && ahnSelection.isDifference

            // if looking at difference between years
            if (isDifferenceMode) {
              // Create a diverging color scale for difference values
              // Using purple for positive values and orange for negative values
              indicatorValueColorscale = scaleLinear().domain([-10, -5, 0, 10, 20]).range(["black", "#D73027", "#cccccc", "green", "black"])
            } else {
              const domain = [...Array(indicator.color.range.length).keys()].map((i) => rangeExtent[0] + i * step)
              indicatorValueColorscale = scaleLinear().domain(domain).range(indicator.color.range)
            }
          }
        } else {
          indicatorValueColorscale = scaleOrdinal().domain(indicator.color.domain).range(indicator.color.range)
        }
      } // Close memoization key check
    } // Close main if block
  } // Close reactive block
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
