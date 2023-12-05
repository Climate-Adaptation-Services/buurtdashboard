<script>
  import { hoveredRegion, mousePosition } from "$lib/stores";
  import { hoveredValue } from "$lib/stores";
  import { checkContrast } from "$lib/noncomponents/checkContrast";

  function getTooltipTop(){
    return ($mousePosition && $mousePosition < 100)
      ? $hoveredRegion.center[1] - 100
      : $hoveredRegion.center[1]
  }
  
</script>

{#if $hoveredRegion !== null}
  <div class='tooltip' style='left:{$hoveredRegion.center[0]}px;top:{getTooltipTop()}px'>
    {#if $hoveredValue === null}
      <div class='tooltip-title'>
        {$hoveredRegion.region}
      </div>
    {/if}
    <div class='tooltip-description'>
      <strong>{$hoveredRegion.name}</strong>
    </div>
    {#if $hoveredValue !== null}
      <div class='tooltip-value'>
        <p>{$hoveredValue.indicator + ': '}<span style='color:{$hoveredValue.color}; background-color:{(checkContrast($hoveredValue.color)) ? 'white' : '#5e5e5f'}; padding:4px; border-radius:3px'>{$hoveredValue.value}</span></p>
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