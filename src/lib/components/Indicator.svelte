<script>
  import { buurtData, buurtSelection, gemeenteSelection } from "$lib/stores";
  import BeeswarmPlot from "./BeeswarmPlot.svelte";
  import Stats from "./Stats.svelte";


  export let w;
  export let h;
  
  let wGraph;
  let hGraph;
  let hStats;

  let variable = 'Paalrot2050Hoog'

</script>

<div class='indicator-div'>
  <div class='indicator-title'><h2>Paalrot</h2></div>

  {#if $buurtData}
    <div class='indicator-body'>
      <div class='indicator-overview'>
        <div class='indicator-stats' bind:clientHeight={hStats}><Stats w={wGraph/4} h={hStats} regio='Nederland' {variable}/></div>
        {#if $gemeenteSelection !== null}
          <div class='indicator-stats'><Stats w={wGraph/4} h={hStats} regio='Gemeente' {variable}/></div>
        {/if}
        {#if $buurtSelection !== null}
          <div class='indicator-stats'><Stats w={wGraph/4} h={hStats} regio='Buurt' {variable}/></div>
          <div class='indicator-stats'><Stats w={wGraph/4} h={hStats} regio='Buurt' {variable}/></div>
        {/if}
      </div>
      <div class='indicator-graph' bind:clientWidth={wGraph} bind:clientHeight={hGraph}>
        <BeeswarmPlot w={wGraph} h={hGraph} />
      </div>
    </div>
  {/if}
</div>


<style>
  .indicator-div{
    height: 100%;
    display: flex;
    flex-direction: column;
    box-shadow: rgba(0, 0, 0, 0.24) 0px 3px 8px;
  }
  .indicator-title{
    display: flex;
    flex:1;
    background-color: whitesmoke;
    align-items: center;
    justify-content: center;
  }

  .indicator-body{
    flex:5;
  }

  .indicator-overview{
    height: 35%;
  }

  .indicator-stats{
    width:25%;
    height: 100%;
    float: left;
  }

  .indicator-graph{
    height: 65%;
    background-color: blanchedalmond;    
  }

</style>