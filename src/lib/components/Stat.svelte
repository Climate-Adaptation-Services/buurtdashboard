<script>

  import { neighbourhoodSelection, municipalitySelection, allNeighbourhoodsJSONData, getIndicatorStore } from "$lib/stores"
  import { onMount } from 'svelte'
  import { getRegionName } from "$lib/utils/getRegionName"
  import { getNoDataReason, isSpecificNoDataReason } from "$lib/utils/valueRetrieval.js"
  import { t } from "$lib/i18n/translate.js"

  export let graphWidth
  export let indicatorHeight
  export let indicator
  export let medianValueOtherYear

  export let regio
  export let xScaleStats
  export let medianValue // Display value (unit-converted)
  export let scaleValue = medianValue // Scale value (original %) for positioning - defaults to medianValue for backward compatibility
  export let rawValue = null // Raw value for determining specific no-data reason
  export let indicatorValueColorscale

  // Determine if we're in difference mode
  // Use dutchTitle for store key to ensure consistency across languages
  $: indicatorStore = getIndicatorStore(indicator.dutchTitle || indicator.title)

  $: currentAHNSelection = $indicatorStore
  $: isDifferenceMode = currentAHNSelection && currentAHNSelection.isDifference

  // Get the specific no-data reason text
  $: noDataText = (() => {
    if (medianValue !== "Geen data") return null
    const reason = getNoDataReason(rawValue)
    return isSpecificNoDataReason(reason) ? t(reason) : "Geen data"
  })()

  $: displayValue = medianValue !== "Geen data" ? Math.round(medianValue * 100) / 100 : noDataText
  


  // Format region name
  let regioNaam = ""
  $: if ($neighbourhoodSelection || $municipalitySelection || $allNeighbourhoodsJSONData) {
    regioNaam = getRegionName(regio)
    if (regioNaam && regioNaam.length > 25) {
      regioNaam = regioNaam.slice(0, 23) + "..."
    }
  }

  // Declare position variables
  let rectWidth = 0
  let rectX = 175
  let textX = 180
  let textAnchor = "start"

  // Calculate bar width using scaleValue for consistent positioning
  $: {
    if (medianValue === "Geen data" || isNaN(scaleValue) || !xScaleStats) {
      rectWidth = 0
    } else {
      const scaledValue = xScaleStats(scaleValue)
      const scaledZero = xScaleStats(0)
      
      if (isNaN(scaledValue) || isNaN(scaledZero)) {
        rectWidth = 0
      } else {
        rectWidth = isDifferenceMode 
          ? Math.abs(scaledValue - scaledZero) 
          : Math.max(0, scaledValue) // Ensure positive width
      }
    }
  }

  // Calculate bar X position using scaleValue for consistent positioning
  $: {
    if (!xScaleStats || isNaN(scaleValue) || medianValue === "Geen data") {
      rectX = 175
    } else {
      const scaledZero = xScaleStats(0)
      if (isNaN(scaledZero)) {
        rectX = 175
      } else {
        rectX = isDifferenceMode 
          ? (scaleValue > 0 ? 175 + scaledZero : 175 + scaledZero - rectWidth) 
          : 175
      }
    }
  }

  // Calculate text X position - position labels outside the bars using scaleValue for consistency
  $: {
    if (medianValue === "Geen data" || !xScaleStats || isNaN(scaleValue)) {
      textX = 180
      textAnchor = "start"
    } else if (isDifferenceMode) {
      const scaledZero = xScaleStats(0)
      if (isNaN(scaledZero) || isNaN(rectWidth)) {
        textX = 180
        textAnchor = "start"
      } else if (scaleValue < 0) {
        // For negative values, position to the left of the bar
        textX = 170 + scaledZero - rectWidth
        textAnchor = "end"
      } else {
        // For positive values, position to the right of the bar
        textX = 170 + scaledZero + rectWidth + 10
        textAnchor = "start"
      }
    } else {
      // For regular mode, position to the right of the bar using scaleValue
      const scaledValue = xScaleStats(scaleValue)
      if (isNaN(scaledValue)) {
        textX = 180
        textAnchor = "start"
      } else {
        textX = 175 + scaledValue + 10
        textAnchor = "start"
      }
    }
  }

  // Add plus sign for positive difference values using scaleValue for consistency
  $: textPlus = isDifferenceMode && scaleValue > 0 ? "+" : ""

  // Get the appropriate color for the bar using scaleValue for consistent colors
  $: barColor =
    medianValue !== "Geen data"
      ? indicatorValueColorscale
        ? (() => {
            // For Nederland when no municipality/neighbourhood selected, use middle of color scale
            if (regio === "Nederland" && $municipalitySelection === null && $neighbourhoodSelection === null && !isDifferenceMode) {
              // Calculate middle value of the indicator's domain
              const domain = indicatorValueColorscale.domain();
              if (domain && domain.length > 0) {
                const middleValue = domain[Math.floor(domain.length / 2)];
                return indicatorValueColorscale(middleValue);
              }
            }
            // Otherwise use actual value for color
            return indicatorValueColorscale(scaleValue);
          })()
        : isDifferenceMode
          ? scaleValue > 0 // Use scaleValue for consistent color logic
            ? "#4682b4" // Blue for positive differences (fallback)
            : scaleValue < 0
              ? "#E1575A" // Red for negative differences (fallback)
              : "#cccccc" // Gray for zero (fallback)
          : "steelblue"
      : "#cccccc" // Gray for no data
</script>

<svg>
  <g transform="translate(0,{indicatorHeight / 2})">
    <!-- Region name label -->
    <text dx={170} dy="0.32em" text-anchor="end" font-size="13">{regioNaam}</text>

    <!-- Zero line for difference mode -->
    {#if isDifferenceMode && xScaleStats}
      {#if !isNaN(xScaleStats(0))}
        <line
          x1={xScaleStats(0) + 175}
          x2={xScaleStats(0) + 175}
          y1="-0.5em"
          y2={indicatorHeight * 0.2}
          stroke="#888888"
          stroke-width="2"
          stroke-dasharray="3,2"
        />
      {/if}
    {/if}

    <!-- Value bar -->
    {#if !isNaN(rectX) && !isNaN(rectWidth) && rectWidth > 0}
      <rect x={rectX} y="-0.4em" fill={barColor} width={rectWidth} height={indicatorHeight * 0.45} rx="4"></rect>
    {/if}

    <!-- Comparison year indicator (hidden by default) -->
    {#if regio !== "Nederland" && xScaleStats && !isNaN(medianValueOtherYear) && !isNaN(xScaleStats(medianValueOtherYear))}
      <g
        class="hoveryear_{indicator.title.replaceAll(' ', '')}"
        transform="translate({xScaleStats(medianValueOtherYear) + 175},0)"
        style="visibility:hidden"
      >
        <line y1="-0.5em" y2={indicatorHeight * 0.06} stroke="#E1575A" stroke-width="5" stroke-linecap="round" />
        <text style="fill:#E1575A; font-size:10px" text-anchor={"middle"} dx={0} dy="1.25em">
          {isDifferenceMode && medianValueOtherYear > 0 ? "+" : ""}{Math.round(medianValueOtherYear * 10) / 10}
        </text>
      </g>
    {/if}

    <!-- Value label -->
    {#if !isNaN(textX)}
      <text
        dx={textX}
        dy="0.34em"
        font-size="11"
        text-anchor={textAnchor}
        fill={isDifferenceMode ? (medianValue > 0 ? "#4682b4" : medianValue < 0 ? "#E1575A" : "#666666") : "#645f5e"}
      >
        {typeof displayValue === 'number' ? textPlus + displayValue : displayValue}
      </text>
    {/if}
  </g>
</svg>

<style>
  svg {
    width: 100%;
    height: 100%;
  }

  rect {
    transition: all 2s;
  }

  text {
    fill: #645f5e;
  }
</style>
