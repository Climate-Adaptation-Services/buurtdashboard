<script>
  import { indicatorsSelection, URLParams } from "$lib/stores"
  import MultiSelect from "svelte-multiselect?client"
  import { browser } from "$app/environment"
  import { selectAll } from "d3"
  import { afterUpdate } from "svelte"
  import { t } from "$lib/i18n/translate.js"

  export let allIndicators

  const indicators = allIndicators.map((d) => d.title)

  function handleIndicatorFilterAdd(e) {
    $URLParams.append("indicator", e.detail.option)
    console.log($URLParams)
    window.history.pushState(null, "", "?" + $URLParams.toString())
  }

  function handleIndicatorFilterRemove(e) {
    console.log(e.detail.option, $URLParams)
    $URLParams.delete("indicator", e.detail.option)
    console.log($URLParams)
    window.history.replaceState(null, "", "?" + $URLParams.toString())
  }

  function handleIndicatorFilterClear() {
    $URLParams.delete("indicator")
    window.history.replaceState(null, "", "?" + $URLParams.toString())
  }

  // deze styling gebeurt hier, omdat het via css niet lukte
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
    />
  </div>
{/if}

<style>
  .multiselectdiv {
    width: 330px;
    color: white;
    font-size: 12px;
  }
</style>
