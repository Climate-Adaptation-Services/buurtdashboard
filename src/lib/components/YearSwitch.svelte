<script>
  import { indicatorYearChanged, jaarSelecties, selectedNeighbourhoodJSONData, alleIndicatoren, backgroundColor } from "$lib/stores"

  export let indicator

  let options
  let selectedAHN

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
    indicatorYearChanged.set([indicator.title, newAHN])
    $jaarSelecties[indicator.title] = newAHN
    jaarSelecties.set($jaarSelecties)
    selectedAHN = newAHN
  }
</script>

<!-- Replacing SVG year switch with two dropdowns -->
<div class="year-switch-dropdowns {selectedDifference === 'Difference' ? 'less-gap' : ''}">
  {#if selectedAHN}
    <div class="dropdown-wrapper">
      <select class="year-dropdown" bind:value={selectedAHN} on:change={yearClick} style="border: 2px solid {$backgroundColor};">
        {#each options as option}
          <option value={option.AHN} selected={option.AHN == selectedAHN}>{option.Jaar}</option>
        {/each}
      </select>
      <span class="dropdown-arrow">&#9662;</span>
    </div>
    {#if selectedDifference !== "Difference"}
      <span class="arrow-between">&#8594;</span>
    {/if}
    <div class="dropdown-wrapper">
      <select
        class="year-dropdown {selectedDifference === 'Difference' ? 'pseudo-disabled' : ''}"
        bind:value={selectedDifference}
        style="border: 2px solid {$backgroundColor};"
      >
        <option value="Difference">Vergelijk jaren</option>
        {#each options as option}
          <option value={option.AHN} selected={option.Jaar === selectedDifference}>{option.Jaar}</option>
        {/each}
      </select>
      {#if selectedDifference !== "Difference"}
        <span class="dropdown-arrow">&#9662;</span>
      {/if}
    </div>
  {/if}
</div>

<style>
  .dropdown-wrapper {
    position: relative;
    display: inline-block;
    width: 140px;
  }
  .dropdown-wrapper:last-child .year-dropdown {
    padding-right: 12px;
  }
  .dropdown-wrapper:last-child .year-dropdown:not(.pseudo-disabled) {
    padding-right: 32px;
  }
  .dropdown-arrow {
    pointer-events: none;
    position: absolute;
    right: 16px;
    top: 50%;
    transform: translateY(-50%);
    font-size: 18px;
    color: #36575b;
    z-index: 2;
  }
  .year-dropdown {
    width: 140px;
    height: 40px;
    border-radius: 12px;
    font-size: 18px;
    padding: 6px 32px 6px 12px;
    color: #333;
    background: #fff;
    box-shadow: 0 2px 8px rgba(54, 87, 91, 0.08);
    transition:
      border 0.3s,
      background 0.3s,
      color 0.3s;
    appearance: none;
    cursor: pointer;
    outline: none;
    border: 2px solid #36575b;
  }
  .year-switch-dropdowns {
    display: flex;
    gap: 20px;
    margin-top: 12px;
    align-items: center;
  }
  .year-switch-dropdowns.less-gap {
    gap: 8px;
  }
  .year-dropdown option {
    color: #333;
    background: #f8f8f8;
  }
  .pseudo-disabled {
    background: #f2f2f2 !important;
    color: #8d8d8d !important;
    border-style: dashed !important;
    opacity: 0.8;
  }
  .arrow-between {
    font-size: 28px;
    color: #36575b;
    margin: 0;
    user-select: none;
    line-height: 1;
  }
</style>
