<script>

  import { neighbourhoodSelection, municipalitySelection, allNeighbourhoodsJSONData, getIndicatorStore } from "$lib/stores"
  import { onMount } from 'svelte'
  import { getRegionName } from "$lib/noncomponents/getRegionName"

  export let graphWidth
  export let indicatorHeight
  export let indicator
  export let medianValueOtherYear

  export let regio
  export let xScaleStats
  export let medianValue // Display value (unit-converted)
  export let scaleValue = medianValue // Scale value (original %) for positioning - defaults to medianValue for backward compatibility
  export let indicatorValueColorscale

  // Determine if we're in difference mode
  $: indicatorStore = getIndicatorStore(indicator.title)
  $: currentAHNSelection = $indicatorStore
  $: isDifferenceMode = currentAHNSelection && currentAHNSelection.isDifference
  
  $: displayValue = medianValue !== "Geen data" ? Math.round(medianValue * 100) / 100 : "Geen data"
  


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
  $: rectWidth = medianValue !== "Geen data" ? (isDifferenceMode ? Math.abs(xScaleStats(scaleValue) - xScaleStats(0)) : xScaleStats(scaleValue)) : 0

  // Calculate bar X position using scaleValue for consistent positioning
  $: rectX = isDifferenceMode ? (scaleValue > 0 ? 175 + xScaleStats(0) : 175 + xScaleStats(0) - rectWidth) : 175

  // Calculate text X position - position labels outside the bars using scaleValue for consistency
  $: {
    if (medianValue === "Geen data") {
      textX = 180
      textAnchor = "start"
    } else if (isDifferenceMode) {
      if (scaleValue < 0) {
        // For negative values, position to the left of the bar
        textX = 170 + xScaleStats(0) - rectWidth
        textAnchor = "end"
      } else {
        // For positive values, position to the right of the bar
        textX = 170 + xScaleStats(0) + rectWidth + 10
        textAnchor = "start"
      }
    } else {
      // For regular mode, position to the right of the bar using scaleValue
      textX = 175 + xScaleStats(scaleValue) + 10
      textAnchor = "start"
    }
  }

  // Add plus sign for positive difference values using scaleValue for consistency
  $: textPlus = isDifferenceMode && scaleValue > 0 ? "+" : ""

  // Get the appropriate color for the bar using scaleValue for consistent colors
  $: barColor =
    medianValue !== "Geen data"
      ? indicatorValueColorscale
        ? indicatorValueColorscale(scaleValue) // Use scaleValue for consistent colors
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
    {#if isDifferenceMode}
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

    <!-- Value bar -->
    <rect x={rectX} y="-0.4em" fill={barColor} width={rectWidth} height={indicatorHeight * 0.45} rx="4"></rect>

    <!-- Comparison year indicator (hidden by default) -->
    {#if regio !== "Nederland"}
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
    <text
      dx={textX}
      dy="0.34em"
      font-size="11"
      text-anchor={textAnchor}
      fill={isDifferenceMode ? (medianValue > 0 ? "#4682b4" : medianValue < 0 ? "#E1575A" : "#666666") : "#645f5e"}
    >
      {displayValue !== "Geen data" ? textPlus + displayValue : "Geen data"}
    </text>
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
