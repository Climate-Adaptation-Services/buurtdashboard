<script>
  import {
    districtTypeJSONData,
    districtTypeAbbreviation,
    allNeighbourhoodsJSONData,
    municipalitySelection,
    neighbourhoodsInMunicipalityJSONData,
    neighbourhoodSelection,
    selectedNeighbourhoodJSONData,
    AHNSelecties,
    configStore,
    getIndicatorStore,
  } from "$lib/stores"
  import { scaleLinear, scaleBand, stack } from "d3"
  import { checkContrast } from "$lib/noncomponents/checkContrast"
  import { getRegionName } from "$lib/noncomponents/getRegionName"
  import { barPlotMouseOut, barPlotMouseOver } from "$lib/noncomponents/barPlotMouseEvents"
  import {
    calcPercentagesForEveryClassMultiIndicator,
    calcPercentagesForEveryClassSingleIndicator,
  } from "$lib/noncomponents/calcPercentagesForEveryClass"
  import { getNumericalValue } from "$lib/noncomponents/valueRetrieval.js"

  export let graphWidth
  export let indicatorHeight
  export let indicator
  export let indicatorValueColorscale
  export let getClassByIndicatorValue
  export let aggregated

  const margin = { bottom: 100, top: 30, left: 30, right: 30 }

  const calcPercentagesForEveryClass = aggregated ? calcPercentagesForEveryClassMultiIndicator : calcPercentagesForEveryClassSingleIndicator

  // Get the indicator-specific store for reactivity
  const indicatorStore = getIndicatorStore(indicator.title)

  // Helper function to get the proper unit symbol
  function getUnitSymbol(indicatorStore, originalValue = null, isInMillions = false) {
    const ahnSelection = indicatorStore
    
    // Check if this indicator has M2 variants and if M2 unit is selected
    if (indicator.variants && indicator.variants.split(',').includes('M2') && 
        ahnSelection?.unit && ahnSelection.unit.toLowerCase() === 'm2') {
      // If value was converted to millions, add M suffix
      if (isInMillions) {
        return ' M m²'
      } else {
        return ' m²'
      }
    } else {
      return '%'
    }
  }

  // Function to calculate display value for a bar segment
  function getDisplayValue(percentageValue, className, regio, indicatorStore) {
    const ahnSelection = indicatorStore
    
    // Check if this indicator has M2 variants and if M2 unit is selected
    if (indicator.variants && indicator.variants.split(',').includes('M2') && 
        ahnSelection?.unit && ahnSelection.unit.toLowerCase() === 'm2') {
      
      // For M2 unit, calculate the total M2 value for this class in this region
      let relevantData
      if (regio === 'Nederland') {
        relevantData = $allNeighbourhoodsJSONData
      } else if (regio === 'Gemeente') {
        relevantData = $neighbourhoodsInMunicipalityJSONData
      } else if (regio === 'Buurt') {
        relevantData = { type: "FeatureCollection", features: [$selectedNeighbourhoodJSONData] }
      } else if (regio === 'Wijktype') {
        relevantData = $districtTypeJSONData
      }
      
      if (!relevantData) return percentageValue
      
      // Calculate the total M2 value for this specific class
      let classM2Total = 0
      
      relevantData.features.forEach(feature => {
        // Get the class attribute (e.g., for class "0-5%", get the corresponding attribute)
        const featureClass = indicator.classes[className]
        if (featureClass) {
          // Create indicator for this specific class with M2 handling
          const classIndicator = { ...indicator, attribute: featureClass }
          const classValue = getNumericalValue(feature, classIndicator)
          if (classValue !== null && !isNaN(classValue)) {
            classM2Total += classValue
          }
        }
      })
      
      // Return the total M2 value for this class, formatted in millions if large
      if (classM2Total >= 100000) {
        return { value: (classM2Total / 1000000), isInMillions: true }
      } else {
        return { value: classM2Total, isInMillions: false }
      }
    } else {
      // Default: return percentage value as-is
      return { value: percentageValue, isInMillions: false }
    }
  }

  let nederlandValues
  $: if ($indicatorStore) {
    nederlandValues = calcPercentagesForEveryClass(indicator, $allNeighbourhoodsJSONData, "Nederland")
  }
  let barPlotData = []
  let regios = []

  $: {
    if ($neighbourhoodSelection !== null && $indicatorStore) {
      if ($selectedNeighbourhoodJSONData.properties[$districtTypeAbbreviation]) {
        barPlotData = [
          nederlandValues,
          calcPercentagesForEveryClass(indicator, $neighbourhoodsInMunicipalityJSONData, "Gemeente"),
          calcPercentagesForEveryClass(indicator, { type: "FeatureCollection", features: [$selectedNeighbourhoodJSONData] }, "Buurt"),
          calcPercentagesForEveryClass(indicator, $districtTypeJSONData, "Wijktype"),
        ]
        regios = ["Nederland", "Gemeente", "Buurt", "Wijktype"]
      } else {
        barPlotData = [
          nederlandValues,
          calcPercentagesForEveryClass(indicator, $neighbourhoodsInMunicipalityJSONData, "Gemeente"),
          calcPercentagesForEveryClass(indicator, { type: "FeatureCollection", features: [$selectedNeighbourhoodJSONData] }, "Buurt"),
        ]
        regios = ["Nederland", "Gemeente", "Buurt"]
      }
    } else if ($municipalitySelection !== null && $indicatorStore) {
      barPlotData = [nederlandValues, calcPercentagesForEveryClass(indicator, $neighbourhoodsInMunicipalityJSONData, "Gemeente")]
      regios = ["Nederland", "Gemeente"]
    } else if ($indicatorStore) {
      barPlotData = [nederlandValues]
      regios = ["Nederland"]
    }
  }
  $: stackedData = stack().keys(Object.keys(indicator.classes))(barPlotData)

  $: xScale = scaleLinear()
    .domain([0, 100])
    .range([margin.left, graphWidth - margin.right])

  $: yScale = scaleBand()
    .domain(regios)
    .range([0, (indicatorHeight - margin.top - margin.bottom) * (barPlotData.length / 2)])
</script>

<svg class={"barplot_" + indicator.attribute} style="height:74%">
  <g class="inner-chart-bar" transform="translate(0, {margin.top})">
    {#each stackedData as stacked, i}
      <g class="stack" fill={indicatorValueColorscale(stacked.key)}>
        {#each stacked as st}
          <rect
            on:mouseover={() => barPlotMouseOver(indicator, indicatorValueColorscale, st, stacked)}
            on:mouseout={barPlotMouseOut(indicator, st, stacked)}
            class={"barplot_rect" + indicator.attribute + stacked.key.replaceAll(" ", "").replaceAll(">", "") + st.data.group}
            x={xScale(st[0])}
            y={yScale(st.data.group)}
            width={xScale(st[1]) - xScale(st[0])}
            height={yScale.bandwidth() / 2.0}
            stroke-width="4"
            style={st.data.group === "Nederland" && $configStore && $configStore.dashboardTitle === "Buurtdashboard Dordrecht"
              ? "visibility: hidden;"
              : ""}
          >
          </rect>
          {#if xScale(st[1]) - xScale(st[0]) > 40}
            <text
              text-anchor="middle"
              x={xScale(st[0]) + (xScale(st[1]) - xScale(st[0])) / 2}
              y={yScale(st.data.group) + 1.5}
              fill={checkContrast(indicatorValueColorscale(stacked.key)) ? "white" : "black"}
              dy="1.1em"
              font-size="14px"
              pointer-events="none">{(() => {
                const displayResult = getDisplayValue(st.data[stacked.key], stacked.key, st.data.group, $indicatorStore)
                const displayValue = displayResult.value
                const isInMillions = displayResult.isInMillions
                const roundedValue = Math.round(displayValue * 10) / 10
                const unitSymbol = getUnitSymbol($indicatorStore, displayValue, isInMillions)
                return roundedValue + unitSymbol
              })()}</text
            >
          {/if}
        {/each}
      </g>
    {/each}
    {#each regios as regio, i}
      {#if regio !== "Nederland" || !($configStore && $configStore.dashboardTitle === "Buurtdashboard Dordrecht")}
        <text style="fill:#645F5E" x={graphWidth / 2} text-anchor="middle" font-size="15px" y={i * yScale.bandwidth() - 5}
          >{getRegionName(regio)}</text
        >
      {/if}
    {/each}
  </g>
</svg>

<style>
  svg {
    width: 100%;
  }

  rect {
    transition: all 2s;
  }
</style>
