<script>
  import { neighbourhoodSelection, neighbourhoodCodeAbbreviation } from "$lib/stores"
  import { getClassName } from "$lib/utils/getClassName"
  import { click, mouseOver, mouseOut } from "$lib/events/neighbourhoodMouseEvents"

  // Props passed from parent Map component
  export let feature
  export let indicator
  export let mapType
  export let path
  export let getMapFillColor
  export let shapeOpacity
  export let indicatorValueColorscale
  export let projection
  export let leafletMap = null
  export let isDifferenceMode
  export let AHNSelecties

  // Forward Leaflet events for main map interaction
  function forwardWheelEvent(e) {
    if (mapType === "main map" && window.leafletMapInstance) {
      // Forward wheel events to Leaflet map for zooming
      e.preventDefault()
      const mapEvent = new WheelEvent("wheel", {
        deltaY: e.deltaY,
        clientX: e.clientX,
        clientY: e.clientY,
        bubbles: true,
      })
      window.leafletMapInstance.getContainer().dispatchEvent(mapEvent)
    }
  }

  function forwardMouseDown(e) {
    if (mapType === "main map" && window.leafletMapInstance) {
      const mapEvent = new MouseEvent("mousedown", {
        clientX: e.clientX,
        clientY: e.clientY,
        bubbles: true,
        button: e.button,
      })
      window.leafletMapInstance.getContainer().dispatchEvent(mapEvent)
    }
  }

  function forwardMouseMove(e) {
    if (mapType === "main map" && window.leafletMapInstance && e.buttons > 0) {
      const mapEvent = new MouseEvent("mousemove", {
        clientX: e.clientX,
        clientY: e.clientY,
        bubbles: true,
        buttons: e.buttons,
      })
      window.leafletMapInstance.getContainer().dispatchEvent(mapEvent)
    }
  }

  function forwardMouseUp(e) {
    if (mapType === "main map" && window.leafletMapInstance) {
      const mapEvent = new MouseEvent("mouseup", {
        clientX: e.clientX,
        clientY: e.clientY,
        bubbles: true,
        button: e.button,
      })
      window.leafletMapInstance.getContainer().dispatchEvent(mapEvent)
    }
  }
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-mouse-events-have-key-events -->
<path
  d={path(feature)}
  class={getClassName(feature, "path", indicator, mapType) + " " + "svgelements_" + feature.properties[$neighbourhoodCodeAbbreviation]}
  fill={(isDifferenceMode, indicatorValueColorscale, AHNSelecties, getMapFillColor(feature))}
  stroke={mapType === "main map"
    ? "grey"
    : feature.properties[$neighbourhoodCodeAbbreviation] === $neighbourhoodSelection
      ? "#E1575A"
      : "white"}
  style="filter:{feature.properties[$neighbourhoodCodeAbbreviation] === $neighbourhoodSelection ? 'drop-shadow(0 0 15px black)' : 'none'}"
  fill-opacity={mapType === "main map" ? shapeOpacity : 1}
  stroke-width={mapType === "main map" ? "1" : feature.properties[$neighbourhoodCodeAbbreviation] === $neighbourhoodSelection ? "3" : "0.5"}
  cursor="pointer"
  on:mouseover={(e) => mouseOver(e, feature, indicator, mapType, indicatorValueColorscale, projection)}
  on:mouseout={() => mouseOut(feature, indicator, mapType)}
  on:click={() => click(feature, indicator, mapType)}
  on:touchstart={(e) => {
    // Show tooltip on touch for mobile devices
    mouseOver(e.touches[0], feature, indicator, mapType, indicatorValueColorscale, projection)
  }}
  on:touchend={() => {
    // Hide tooltip when touch ends
    setTimeout(() => mouseOut(feature, indicator, mapType), 1000)
  }}
  on:wheel={forwardWheelEvent}
  on:mousedown={forwardMouseDown}
  on:mousemove={forwardMouseMove}
  on:mouseup={forwardMouseUp}
/>

<style>
  path {
    pointer-events: auto;
    transition: d 0.21s ease-out;
  }

  /* Fast transitions during panning - when parent SVG has panning class */
  :global(svg.panning) path {
    transition: d 0.05s ease-out;
  }

  /* Ensure mouse wheel events pass through shapes to Leaflet map */
  path:hover {
    fill-opacity: 1 !important;
  }
</style>