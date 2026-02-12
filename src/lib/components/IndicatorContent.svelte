<script>
  import { municipalitySelection, neighbourhoodsInMunicipalityJSONData, allNeighbourhoodsJSONData, getIndicatorStore, globalBEBSelection } from "$lib/stores"
  import { scaleLinear, extent, scaleOrdinal } from "d3"
  import IndicatorInfo from "./IndicatorInfo.svelte"
  import IndicatorTitle from "./IndicatorTitle.svelte"
  import IndicatorBody from "./IndicatorBody.svelte"
    import { getIndicatorAttribute } from "$lib/utils/getIndicatorAttribute"
  import { getRawValue, isValidValue } from "$lib/utils/valueRetrieval"

  export let indicatorHeight
  export let indicator
  export let isLoading = false

  // Get the dedicated store for this specific indicator - naturally isolated!
  // Use dutchTitle for store key to ensure consistency across languages
  const indicatorStore = getIndicatorStore(indicator.dutchTitle || indicator.title)



  let graphWidth
  const titleHeight = 135
  const bodyHeight = indicatorHeight - titleHeight

  // Initialize with a default color scale to prevent null errors
  let indicatorValueColorscale = (value) => "#cccccc"

  // MEMOIZED: Create color scale only when specific indicator data changes
  let colorScaleMemoKey = ""
  $: {
    // Create color scale when we have indicator data, either for selected municipality or all Netherlands
    const relevantData = $municipalitySelection !== null ? $neighbourhoodsInMunicipalityJSONData : $allNeighbourhoodsJSONData

    // Allow initial rendering with default color scale even without data
    if (indicator) {
      // Get the current AHN selection including BEB
      const ahnSelection = $indicatorStore || {}
      const isDifferenceMode = ahnSelection && typeof ahnSelection === "object" && ahnSelection.isDifference

      // Use global BEB selection directly for reactivity
      const bebSelection = $globalBEBSelection

      // Create base attribute considering BEB selection
      let baseAttribute = indicator.attribute
      const variants = indicator.variants ? indicator.variants.split(',').map(v => v.trim()) : []
      const bebVariant = variants.find(v => v !== 'M2' && v !== '') // Find the BEB variant (not M2)
      if (bebVariant) {
        if (bebSelection === 'bebouwde_kom') {
          baseAttribute = baseAttribute + '_' + bebVariant
        }
      }
      
      // Get the final indicator attribute with year
      const indicatorAttribute = getIndicatorAttribute(indicator, baseAttribute)

      // Create key from only the data that matters for this indicator's color scale
      const newMemoKey = JSON.stringify({
        indicatorTitle: indicator.title,
        indicatorAttribute,
        isDifferenceMode,
        municipalitySelection: $municipalitySelection,
        bebSelection: bebSelection, // Include BEB selection in memo key
        // Use getRawValue to handle Dordrecht's AHN underscore naming (e.g., "BKB_AHN3" vs "BKBAHN3")
        dataValues: relevantData?.features?.map((d) => getRawValue(d, indicator)).sort(),
        hasData: !!relevantData?.features
      })

      // Only recreate color scale if the key actually changed
      if (newMemoKey !== colorScaleMemoKey) {
        colorScaleMemoKey = newMemoKey


        if (indicator.numerical) {
          let rangeExtent = [0, 1] // default value [0,1]

          // Only calculate extent if we have data, otherwise use config defaults
          // Use getRawValue to handle Dordrecht's AHN underscore naming and BEB variants
          // Filter out invalid values like -9999 before calculating extent
          if (relevantData?.features) {
            const validValues = relevantData.features
              .map((d) => getRawValue(d, indicator))
              .filter((v) => isValidValue(v))
              .map((v) => +v)

            if (validValues.length > 0) {
              rangeExtent = extent(validValues)
            }
          }

          // this can deal with any amount of colors in the scale
          const step = (rangeExtent[1] - rangeExtent[0]) / (indicator.color.range.length - 1)

          // Check if we're in difference mode
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
        } else {
          // Use .unknown() to set gray color for no-data values (no_slow_traffic_route, no_ahn5_data, no_bebouwde_kom, No data)
          indicatorValueColorscale = scaleOrdinal().domain(indicator.color.domain).range(indicator.color.range).unknown('#cccccc')
        }
      } // Close memoization key check
    } // Close main if block
  } // Close reactive block
</script>

<div class="indicator-div">
  <IndicatorInfo {indicator} {graphWidth} />
  <IndicatorTitle {indicator} {titleHeight} />
  <IndicatorBody {indicator} {graphWidth} {bodyHeight} {indicatorValueColorscale} {isLoading} />
</div>

<style>
  .indicator-div {
    height: 100%;
    display: flex;
    flex-direction: column;
    box-shadow: rgba(0, 0, 0, 0.24) 0px 3px 8px;
    position: relative;
  }

  .indicator-skeleton {
    height: 100%;
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .skeleton-title {
    height: 50px;
    background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
    background-size: 200% 100%;
    animation: loading 1.5s infinite;
    border-radius: 8px;
  }

  .skeleton-content {
    flex: 1;
    display: flex;
    gap: 16px;
    flex-direction: column;
  }

  .skeleton-chart {
    flex: 1;
    background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
    background-size: 200% 100%;
    animation: loading 1.5s infinite;
    border-radius: 8px;
  }

  .skeleton-map {
    height: 200px;
    background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
    background-size: 200% 100%;
    animation: loading 1.5s infinite;
    border-radius: 8px;
  }

  @keyframes loading {
    0% {
      background-position: 200% 0;
    }
    100% {
      background-position: -200% 0;
    }
  }

</style>
