<script>
  import { municipalitySelection, neighbourhoodSelection, URLParams } from "$lib/stores"
  import { addURLParameter, removeURLParameter } from "$lib/services/urlManager"
  import { selectAll } from "d3"
  import Select from "svelte-select"
  import { t } from "$lib/i18n/translate.js"

  export let lijstAlleBuurtenInMunicipalityVoorDropdown

  // Removed neighborhood list console log

  function handleBuurtChange(e) {
    // Don't update URL params or selection if the value is being set programmatically from URL
    // (i.e., if it's already the same as what we're setting)
    if ($neighbourhoodSelection === e.detail.value) {
      return
    }

    // Create new URLSearchParams from current one to preserve all other parameters
    const newParams = new URLSearchParams($URLParams)
    newParams.set("buurt", e.detail.value)
    $URLParams = newParams
    addURLParameter()

    neighbourhoodSelection.set(e.detail.value)
    selectAll(".svgelements_" + e.detail.value).raise()
  }

  function handleBuurtClear(e) {
    // Create new URLSearchParams from current one to preserve all other parameters (e.g., indicators)
    const newParams = new URLSearchParams($URLParams)
    newParams.delete("buurt")
    $URLParams = newParams
    removeURLParameter()

    neighbourhoodSelection.set(null)
  }
</script>

{#if $municipalitySelection !== null}
  <p class="select-title">{t("Buurt")}:</p>
  <Select
    items={lijstAlleBuurtenInMunicipalityVoorDropdown}
    placeholder="{t('Zoek_buurt')}..."
    value={$neighbourhoodSelection}
    on:change={handleBuurtChange}
    on:clear={handleBuurtClear}
  />
{/if}
