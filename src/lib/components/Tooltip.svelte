<script>
  import { tooltipRegion, mousePosition } from "$lib/stores";
  import { tooltipValues } from "$lib/stores";
  import { checkContrast } from "$lib/noncomponents/checkContrast";

  function getTooltipTop(){
    return ($mousePosition && $mousePosition < 100)
      ? $tooltipRegion.center[1] - 100
      : $tooltipRegion.center[1]
  }

  function getTooltipLeft(){
    return (window.innerWidth - $tooltipRegion.center[0] < 300)
      ? $tooltipRegion.center[0] - 180
      : $tooltipRegion.center[0]
  }
  
</script>

{#if $tooltipRegion !== null}
  <div class='tooltip' style='left:{getTooltipLeft()}px;top:{getTooltipTop()}px'>
    {#if $tooltipValues === null}
      <div class='tooltip-title'>
        {$tooltipRegion.region}
      </div>
    {/if}
    <div class='tooltip-description'>
      <strong>{$tooltipRegion.name}</strong>
    </div>
    {#if $tooltipValues !== null}
      <div class='tooltip-value'>
        <p>{$tooltipValues.indicator + ': '}<span style='color:{$tooltipValues.color}; background-color:{(checkContrast($tooltipValues.color)) ? 'white' : '#5e5e5f'}; padding:4px; border-radius:3px'>{$tooltipValues.value}</span></p>
      </div>
    {/if}
  </div>
{/if}

<style>
  .tooltip{
    position:fixed;
    display: flex;
    background-color: white;
    flex-direction: column;
    transform: translate(5%, 20%);
    z-index: 10000;
    align-items: center;
    justify-content: center;
    pointer-events: none;
    box-shadow: rgba(0, 0, 0, 0.3) 0px 19px 38px, rgba(0, 0, 0, 0.22) 0px 15px 12px;
    border-radius: 10px;
    padding-left:30px;
    padding-right:30px;
    padding-top:15px;
    padding-bottom:15px
  }

  p{
    margin:5px;
  }

</style>