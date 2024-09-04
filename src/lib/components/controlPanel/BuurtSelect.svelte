<script>
  import { gemeenteSelection, buurtSelection, URLParams } from "$lib/stores";
  import { selectAll } from 'd3';
  import Select from 'svelte-select'
  import { _ } from 'svelte-i18n'


  export let buurtList

  function handleBuurtChange(e){
    $URLParams.set('buurt', e.detail.value);
    window.history.pushState(null, '', '?' + $URLParams.toString());

    buurtSelection.set(e.detail.value)
    selectAll('.svgelements_' + e.detail.value)
      .raise()
  }

  function handleBuurtClear(e){
    $URLParams.delete('buurt')
    window.history.replaceState(null, '', '?' + $URLParams.toString());

    buurtSelection.set(null)
  }

</script>

{#if $gemeenteSelection !== null}
  <p class='select-title'>{$_("Buurt")}:</p>
  <Select items={buurtList} placeholder="{$_("Zoek_buurt")}..." value={$buurtSelection} on:change={handleBuurtChange} on:clear={handleBuurtClear}/>
{/if}