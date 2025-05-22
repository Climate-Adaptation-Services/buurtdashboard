<script>
  import {
    indicatorYearChanged,
    AHNSelecties,
    selectedNeighbourhoodJSONData,
    backgroundColor,
    neighbourhoodsInMunicipalityJSONData,
  } from "$lib/stores"

  export let indicator

  let options
  let selectedAHN

  const ahnVersions = indicator.AHNversie.split(",")

  $: console.log(options, "options")

  $: {
    if ($selectedNeighbourhoodJSONData) {
      options = ahnVersions.map((ahn) => {
        return { AHN: ahn, Jaar: $selectedNeighbourhoodJSONData.properties["Jaar" + ahn] }
      })
    } else if ($neighbourhoodsInMunicipalityJSONData) {
      options = ahnVersions.map((ahn) => {
        return { AHN: ahn, Jaar: [] }
      })
      $neighbourhoodsInMunicipalityJSONData.features.forEach((nh) => {
        ahnVersions.forEach((ahn) => {
          if (!options.find((j) => j.AHN === ahn).Jaar.includes(nh.properties["Jaar" + ahn])) {
            options.find((j) => j.AHN === ahn).Jaar += nh.properties["Jaar" + ahn]
          }
        })
      })
    } else {
      options = [
        { AHN: "AHN2", Jaar: "2006 - 2012" },
        { AHN: "AHN4", Jaar: "2018 - 2020" },
      ]
    }
  }

  selectedNeighbourhoodJSONData.subscribe(() => {
    if ($selectedNeighbourhoodJSONData) {
      selectedAHN = $AHNSelecties[indicator.title]
    }
  })

  let selectedDifference = "Difference"

  function yearClick(change) {
    const newAHN = change.target.value
    indicatorYearChanged.set([indicator.title, newAHN])
    $AHNSelecties[indicator.title] = newAHN
    AHNSelecties.set($AHNSelecties)
    selectedAHN = newAHN
  }

  function yearClickDifference(change) {
    const differenceAHN = change.target.value
    indicatorYearChanged.set([indicator.title, "AHN2"])
    $AHNSelecties[indicator.title] = ["AHN2", "AHN4"]
    AHNSelecties.set($AHNSelecties)
    selectedAHN = "AHN2"
  }
</script>

<!-- Replacing SVG year switch with two dropdowns -->
<div class="year-switch-dropdowns {selectedDifference === 'Difference' ? 'less-gap' : ''}">
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
  {#if indicator.numerical}
    <div class="dropdown-wrapper">
      <select
        class="year-dropdown {selectedDifference === 'Difference' ? 'pseudo-disabled' : ''}"
        bind:value={selectedDifference}
        on:change={yearClickDifference}
        style="border: 2px solid {$backgroundColor};"
      >
        {#if selectedDifference === "Difference"}
          <option value="Difference">Vergelijk jaren</option>
        {:else}
          <option value="Difference">Stop vergelijken</option>
        {/if}
        {#each options.slice(1) as option}
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
    width: 150px;
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
    width: 150px;
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
