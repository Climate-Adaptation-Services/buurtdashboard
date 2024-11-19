<script>
    import Select from 'svelte-select'
    import { t } from '$lib/i18n/translate.js';

    import { URLParams, gemeenteSelection, buurtSelection } from '$lib/stores';

    export let lijstAlleGemeentesVoorDropdown
    
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

<p class='select-title'>{t("Gemeente")}:</p>
<Select items={lijstAlleGemeentesVoorDropdown} placeholder={t("Zoek_gemeente")} value={$gemeenteSelection} on:change={handleGemeenteChange} on:clear={handleGemeenteClear}/>
