<script>
    import Select from 'svelte-select'
    import { t } from '$lib/i18n/translate.js';

    import { URLParams, municipalitySelection, neighbourhoodSelection } from '$lib/stores';

    export let lijstAlleGemeentesVoorDropdown
    
    function handleGemeenteChange(e){
      $URLParams.set('municipality', e.detail.value);
      window.history.pushState(null, '', '?' + $URLParams.toString());

      municipalitySelection.set(null)
      neighbourhoodSelection.set(null)
      setTimeout(() => { municipalitySelection.set(e.detail.value) }, 1);    
    }

    function handleGemeenteClear(e){
      $URLParams.delete('municipality')
      $URLParams.delete('neighbourhood')
      window.history.replaceState(null, '', '?' + $URLParams.toString());

      municipalitySelection.set(null)
      neighbourhoodSelection.set(null)
    }
</script>

<p class='select-title'>{t("Gemeente")}:</p>
<Select items={lijstAlleGemeentesVoorDropdown} placeholder={t("Zoek_municipality")} value={$municipalitySelection} on:change={handleGemeenteChange} on:clear={handleGemeenteClear}/>
