<script>
  import { indicatorsSelection, URLParams } from "$lib/stores"
  import { addURLParameter, removeURLParameter } from "$lib/services/urlManager"
  import MultiSelect from "svelte-multiselect?client"
  import { browser } from "$app/environment"
  import { selectAll } from "d3"
  import { afterUpdate } from "svelte"
  import { t } from "$lib/i18n/translate.js"

  export let allIndicators

  const indicators = allIndicators.map((d) => d.title)

  function handleIndicatorFilterAdd(e) {
    $URLParams.append("indicator", e.detail.option)
    addURLParameter()
  }

  function handleIndicatorFilterRemove(e) {
    $URLParams.delete("indicator", e.detail.option)
    removeURLParameter()
  }

  function handleIndicatorFilterClear() {
    $URLParams.delete("indicator")
    removeURLParameter()
  }

  // Dynamic styling applied here due to CSS limitations with third-party component
  afterUpdate(() => {
    selectAll("li").style("color", "black").style("cursor", "pointer").attr("background-color", "white").style("text-align", "left")

    selectAll(".disabled").style("color", "steelblue").style("cursor", "default").attr("background-color", "#e5e3e3").style("text-align", "center")

    selectAll(".selected li").style("background-color", "white")
  })
</script>

{#if browser}
  <div class="multiselectdiv">
    <p style="margin-bottom:5px">{`Filter ${t("indicatoren")}:`}</p>
    <MultiSelect
      bind:value={$indicatorsSelection}
      options={indicators}
      on:add={handleIndicatorFilterAdd}
      on:remove={handleIndicatorFilterRemove}
      on:removeAll={handleIndicatorFilterClear}
      maxOptionsToShow={8}
    />
  </div>
{/if}

<style>
  .multiselectdiv {
    width: 330px;
    color: white;
    font-size: 12px;
  }

  /* Ensure dropdown doesn't get cut off at bottom of screen */
  .multiselectdiv :global(.multiselect) {
    position: relative;
  }

  .multiselectdiv :global(.multiselect .options) {
    max-height: 200px;
    overflow-y: auto;
    z-index: 1000;
  }

  /* Try to position dropdown above if close to bottom */
  .multiselectdiv :global(.multiselect.open) {
    position: relative;
  }

  .multiselectdiv :global(.multiselect .options) {
    position: absolute;
    width: 100%;
    background: white;
    border: 1px solid #ccc;
    border-radius: 4px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  }
</style>
