<script>
    import Select from 'svelte-select'

    import { URLParams, gemeenteSelection, buurtSelection } from '$lib/stores';

    export let gemeenteList
    
    function handleGemeenteChange(e){
      $URLParams.set('gemeente', e.detail.value);
      window.history.pushState(null, '', '?' + $URLParams.toString());

      gemeenteSelection.set(null)
      buurtSelection.set(null)
      setTimeout(() => { gemeenteSelection.set(e.detail.value) }, 1);    
    }

    function handleGemeenteClear(e){
      $URLParams.delete('gemeente')
      $URLParams.delete('buurt')
      window.history.replaceState(null, '', '?' + $URLParams.toString());

      gemeenteSelection.set(null)
      buurtSelection.set(null)
    }
</script>


<p class='select-title'>Gemeente:</p>
<Select items={gemeenteList} placeholder="Zoek gemeente..." value={$gemeenteSelection} on:change={handleGemeenteChange} on:clear={handleGemeenteClear}/>
