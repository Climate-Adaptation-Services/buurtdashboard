<script>
  import Select from "svelte-select"
  import { t } from "$lib/i18n/translate.js"
  import { onMount } from "svelte"
  import { URLParams, municipalitySelection, neighbourhoodSelection, configStore } from "$lib/stores"
  import { addURLParameter, removeURLParameter } from "$lib/services/urlManager"

  export let lijstAlleGemeentesVoorDropdown

  function handleGemeenteChange(e) {
    // Don't update URL params or selection if the value is being set programmatically from URL
    // (i.e., if it's already the same as what we're setting)
    if ($municipalitySelection === e.detail.value) {
      if (import.meta.env.DEV) {
        console.log('GemeenteSelect: Skipping change handler - value already set:', e.detail.value);
      }
      return
    }

    if (import.meta.env.DEV) {
      console.log('GemeenteSelect: User changed gemeente to:', e.detail.value);
    }

    // Create new URLSearchParams from current one to preserve all other parameters
    const newParams = new URLSearchParams($URLParams)
    newParams.set("gemeente", e.detail.value)
    // Delete buurt since it's no longer valid for the new municipality
    newParams.delete("buurt")
    $URLParams = newParams
    addURLParameter()

    // Clear neighbourhood first since it's no longer valid for the new municipality
    neighbourhoodSelection.set(null)
    // Then set the new municipality directly without setTimeout
    municipalitySelection.set(e.detail.value)
  }

  function handleGemeenteClear(e) {
    // Create new URLSearchParams from current one to preserve all other parameters (e.g., indicators)
    const newParams = new URLSearchParams($URLParams)
    newParams.delete("gemeente")
    newParams.delete("buurt")
    $URLParams = newParams
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
