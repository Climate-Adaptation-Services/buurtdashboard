<script>
  import { municipalitySelection, neighbourhoodSelection, URLParams } from "$lib/stores"
  import { selectAll } from "d3"
  import Select from "svelte-select"
  import { t } from "$lib/i18n/translate.js"

  export let lijstAlleBuurtenInMunicipalityVoorDropdown

  // Removed neighborhood list console log

  function handleBuurtChange(e) {
    $URLParams.set("buurt", e.detail.value)
    window.history.pushState(null, "", "?" + $URLParams.toString())

    neighbourhoodSelection.set(e.detail.value)
    selectAll(".svgelements_" + e.detail.value).raise()
  }

  function handleBuurtClear(e) {
    $URLParams.delete("buurt")
    window.history.replaceState(null, "", "?" + $URLParams.toString())

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
