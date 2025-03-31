<script>
  import Select from "svelte-select"
  import { t } from "$lib/i18n/translate.js"
  import { onMount } from "svelte"
  import { URLParams, municipalitySelection, neighbourhoodSelection } from "$lib/stores"

  export let lijstAlleGemeentesVoorDropdown

  function handleGemeenteChange(e) {
    $URLParams.set("gemeente", e.detail.value)
    window.history.pushState(null, "", "?" + $URLParams.toString())

    municipalitySelection.set(null)
    neighbourhoodSelection.set(null)
    setTimeout(() => {
      municipalitySelection.set(e.detail.value)
    }, 1)
  }

  function handleGemeenteClear(e) {
    $URLParams.delete("gemeente")
    $URLParams.delete("buurt")
    window.history.replaceState(null, "", "?" + $URLParams.toString())

    municipalitySelection.set(null)
    neighbourhoodSelection.set(null)
  }
</script>

<p class="select-title">{t("Gemeente")}:</p>
<Select
  items={lijstAlleGemeentesVoorDropdown}
  placeholder={t("Zoek_gemeente")}
  value={$municipalitySelection}
  on:change={handleGemeenteChange}
  on:clear={handleGemeenteClear}
/>
