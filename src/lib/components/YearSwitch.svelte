<script>
  import { indicatorYearChanged, jaarSelecties, selectedNeighbourhoodJSONData } from "$lib/stores"

  export let indicator

  let options
  let selectedAHN

  $: console.log(selectedAHN, options)

  $: {
    options = $selectedNeighbourhoodJSONData
      ? indicator.AHNversie.split(",").map((ahn) => {
          return { AHN: ahn, Jaar: $selectedNeighbourhoodJSONData.properties["Jaar" + ahn] }
        })
      : []
  }

  selectedNeighbourhoodJSONData.subscribe(() => {
    if ($selectedNeighbourhoodJSONData) {
      selectedAHN = $jaarSelecties[indicator.title]
    }
  })

  let selectedDifference = "Difference"

  function yearClick(change) {
    const newAHN = change.target.value
    for (const key in indicator.classes) {
      if (indicator.classes.hasOwnProperty(key)) {
        indicator.classes[key] = indicator.classes[key].slice(0, -4) + newAHN
      }
    }
    indicator.attribute = indicator.attribute.slice(0, -4) + newAHN

    indicatorYearChanged.set([indicator.title, newAHN])
    $jaarSelecties[indicator.title] = newAHN
    jaarSelecties.set($jaarSelecties)
    selectedAHN = newAHN
  }
</script>

<!-- Replacing SVG year switch with two dropdowns -->
<div class="year-switch-dropdowns">
  {#if selectedAHN}
    <select class="year-dropdown" bind:value={selectedAHN} on:change={yearClick}>
      {#each options as option}
        <option value={option.AHN} selected={option.AHN == selectedAHN}>{option.Jaar}</option>
      {/each}
    </select>
    <select class="year-dropdown {selectedAHN === 'Difference' ? 'disabled-dropdown' : ''}" bind:value={selectedDifference}>
      <option value="Difference">Verschil</option>
      {#each options as option}
        <option value={option.AHN} selected={option.Jaar === selectedDifference}>{option.Jaar}</option>
      {/each}
    </select>
  {/if}
</div>

<style>
  .year-switch-dropdowns {
    display: flex;
    gap: 20px;
    margin-top: 12px;
    align-items: center;
  }
  .year-dropdown {
    width: 110px;
    height: 36px;
    border: 2px solid lightgrey;
    border-radius: 12px;
    background: lightgrey;
    color: #333;
    font-size: 18px;
    padding: 3px 10px;
    transition:
      border 0.3s,
      background 0.3s;
    box-shadow: 0 0 8px rgba(160, 160, 160, 0.08);
  }
  .year-dropdown:focus {
    outline: none;
    border-color: #b0b0b0;
    background: #ededed;
  }
  .year-dropdown option {
    background: lightgrey;
    color: #333;
  }
  .year-dropdown option:hover {
    background: #ededed;
  }
  .year-dropdown option[selected] {
    background: lightgrey;
    color: white;
  }
  .disabled-dropdown {
    background: #e0e0e0;
    color: #999;
    cursor: not-allowed;
    border-color: #ccc;
    opacity: 0.7;
  }
  .disabled-dropdown:focus {
    background: #e0e0e0;
    color: #999;
    border-color: #ccc;
  }
</style>
