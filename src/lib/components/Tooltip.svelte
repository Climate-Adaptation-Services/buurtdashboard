<script>
  import { tooltipRegion, mousePosition } from "$lib/stores"
  import { tooltipValues } from "$lib/stores"
  import { checkContrast } from "$lib/utils/checkContrast"

  // Approximate tooltip height (title + description + value + padding)
  const TOOLTIP_HEIGHT = 120

  function getTooltipTop() {
    const baseTop = $tooltipRegion.center[1]

    // Check if too close to top
    if ($mousePosition && $mousePosition < 100) {
      return baseTop - 100
    }

    // Check if too close to bottom (accounting for tooltip height and 20% transform offset)
    const bottomMargin = 50
    const effectiveBottom = baseTop + (TOOLTIP_HEIGHT * 1.2) + bottomMargin
    if (effectiveBottom > window.innerHeight) {
      // Position tooltip above the cursor instead of below
      return baseTop - TOOLTIP_HEIGHT - 30
    }

    return baseTop
  }

  function getTooltipLeft() {
    return window.innerWidth - $tooltipRegion.center[0] < 300 ? $tooltipRegion.center[0] - 180 : $tooltipRegion.center[0]
  }

  // afstand tot spelen should be >1000
  $: if (
    $tooltipValues &&
    [
      "Afstand tot spelen | 0-6 jaar",
      "Afstand tot spelen | 6-13 jaar",
      "Afstand tot spelen | 13-18 jaar",
      "Afstand tot spelen | alle toestellen",
    ].includes($tooltipValues.indicator) &&
    $tooltipValues.value === 1000
  ) {
    $tooltipValues.value = ">1000"
  }
</script>

{#if $tooltipRegion !== null}
  <div class="tooltip" style="left:{getTooltipLeft()}px;top:{getTooltipTop()}px">
    {#if $tooltipRegion.mapType === 'main map'}
      <div class="tooltip-description">
        {$tooltipRegion.region}
      </div>
      <div class="tooltip-title">
        <strong>{$tooltipRegion.name}</strong>
      </div>
    {:else}
      <div class="tooltip-title">
        <strong>{$tooltipRegion.name}</strong>
      </div>
    {/if}
    {#if $tooltipValues !== null}
      <div class="tooltip-value">
        <p>
          {$tooltipValues.indicator + ": "}<span
            style="color:{$tooltipValues.color}; background-color:{checkContrast($tooltipValues.color)
              ? 'white'
              : '#5e5e5f'}; padding:4px; border-radius:3px">{$tooltipValues.value}</span
          >
        </p>
      </div>
    {/if}
  </div>
{/if}

<style>
  .tooltip {
    position: fixed;
    display: flex;
    background-color: white;
    flex-direction: column;
    transform: translate(5%, 20%);
    z-index: 10000;
    align-items: center;
    justify-content: center;
    pointer-events: none;
    box-shadow:
      rgba(0, 0, 0, 0.3) 0px 19px 38px,
      rgba(0, 0, 0, 0.22) 0px 15px 12px;
    border-radius: 10px;
    padding-left: 30px;
    padding-right: 30px;
    padding-top: 15px;
    padding-bottom: 15px;
  }

  .tooltip-title {
    width: 100%;
    text-align: center;
  }

  .tooltip-description {
    width: 100%;
    text-align: center;
    font-size: 0.9em;
    color: #666;
  }

  .tooltip-value {
    width: 100%;
    text-align: center;
  }

  p {
    margin: 5px;
  }
</style>
