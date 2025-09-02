<script>
  import Select from "svelte-select"
  import { t } from "$lib/i18n/translate.js"
  import { onMount } from "svelte"
  import { URLParams, municipalitySelection, neighbourhoodSelection, configStore } from "$lib/stores"
  import { addURLParameter, removeURLParameter } from "$lib/noncomponents/updateURLParams"

  export let lijstAlleGemeentesVoorDropdown

  function handleGemeenteChange(e) {
    $URLParams.set("gemeente", e.detail.value)
    addURLParameter()

    // Clear neighbourhood first since it's no longer valid for the new municipality
    neighbourhoodSelection.set(null)
    // Then set the new municipality directly without setTimeout
    municipalitySelection.set(e.detail.value)
  }

  function handleGemeenteClear(e) {
    $URLParams.delete("gemeente")
    $URLParams.delete("buurt")
    removeURLParameter()

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
  disabled={$configStore.defaultMunicipality !== null}
/>
