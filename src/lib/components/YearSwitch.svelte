<script>
  import { AHNSelecties, selectedNeighbourhoodJSONData, neighbourhoodsInMunicipalityJSONData, configStore } from "$lib/stores"

  export let indicator

  let options = []
  let selectedAHN
  let selectedDifference = "Difference"

  // Parse AHN versions from the indicator
  const ahnVersions = indicator.AHNversie.split(",")

  // Reactive statement to update options when data changes
  $: {
    if ($selectedNeighbourhoodJSONData) {
      // For a selected neighborhood, get years directly from its properties
      options = ahnVersions.map((ahn) => ({
        AHN: ahn,
        Jaar: $selectedNeighbourhoodJSONData.properties["Jaar" + ahn],
      }))
    } else if ($neighbourhoodsInMunicipalityJSONData) {
      // For municipality view, collect all unique years
      options = ahnVersions.map((ahn) => ({ AHN: ahn, Jaar: [] }))

      $neighbourhoodsInMunicipalityJSONData.features.forEach((nh) => {
        ahnVersions.forEach((ahn) => {
          if (!options.find((j) => j.AHN === ahn).Jaar.includes(nh.properties["Jaar" + ahn])) {
            options.find((j) => j.AHN === ahn).Jaar += nh.properties["Jaar" + ahn]
          }
        })
      })
    }
  }

  // Update selected AHN when neighborhood data changes
  selectedNeighbourhoodJSONData.subscribe(() => {
    if ($selectedNeighbourhoodJSONData) {
      selectedAHN = $AHNSelecties[indicator.title]
    }
  })

  /**
   * Handle base year selection change
   */
  function yearClick(change) {
    const newAHN = change.target.value
    
    // Check if we're currently in difference mode
    const currentSelection = $AHNSelecties[indicator.title]
    const isDifferenceMode = currentSelection && typeof currentSelection === 'object' && currentSelection.isDifference
    
    if (isDifferenceMode) {
      // Maintain difference mode but update the base year
      $AHNSelecties[indicator.title] = {
        baseYear: newAHN,
        compareYear: currentSelection.compareYear,
        isDifference: true
      }
      
      // If the new base year is >= compare year, find a new valid compare year
      const baseNum = parseInt(newAHN.replace(/\D/g, "") || "0", 10)
      const compareNum = parseInt(currentSelection.compareYear.replace(/\D/g, "") || "0", 10)
      
      if (baseNum >= compareNum) {
        // Find the next available year after the new base year
        const nextOption = options.find(option => {
          if (!option || !option.AHN) return false
          const optionNum = parseInt(option.AHN.replace(/\D/g, "") || "0", 10)
          return optionNum > baseNum
        })
        
        if (nextOption) {
          $AHNSelecties[indicator.title].compareYear = nextOption.AHN
          selectedDifference = nextOption.AHN
        } else {
          // No valid compare year available, revert to regular mode
          $AHNSelecties[indicator.title] = newAHN
          selectedDifference = "Difference"
        }
      } else {
        // Keep the current compare year
        selectedDifference = currentSelection.compareYear
      }
    } else {
      // Regular mode - just update the base year
      $AHNSelecties[indicator.title] = newAHN
    }
    
    AHNSelecties.set($AHNSelecties)
    selectedAHN = newAHN
  }

  /**
   * Determine if an option should be shown in the difference dropdown
   * Only shows years later than the selected base year
   */
  function isLaterVersion(optionAHN) {
    try {
      if (!optionAHN || !selectedAHN) return false

      // Handle case when selectedAHN is an object (difference mode)
      const baseAHN = typeof selectedAHN === "object" ? selectedAHN.baseYear : selectedAHN

      // Make sure we're working with strings
      const optionStr = String(optionAHN)
      const selectedStr = String(baseAHN)

      // Extract numeric parts from AHN versions (e.g., AHN2 → 2)
      const optionNum = parseInt(optionStr.replace(/\D/g, "") || "0", 10)
      const selectedNum = parseInt(selectedStr.replace(/\D/g, "") || "0", 10)

      return optionNum > selectedNum
    } catch (e) {
      console.error("Error comparing AHN versions:", e)
      return false
    }
  }

  /**
   * Handle difference year selection change
   */
  function yearClickDifference(change) {
    const differenceAHN = change.target.value

    if (differenceAHN === "Difference") {
      // Reset to single year selection
      $AHNSelecties[indicator.title] = selectedAHN
      selectedDifference = "Difference"
    } else {
      // Store both years for difference calculation
      $AHNSelecties[indicator.title] = {
        baseYear: selectedAHN,
        compareYear: differenceAHN,
        isDifference: true,
      }
      selectedDifference = differenceAHN
    }

    AHNSelecties.set($AHNSelecties)
  }
</script>

<!-- Replacing SVG year switch with two dropdowns -->
<div class="year-switch-dropdowns {selectedDifference === 'Difference' ? 'less-gap' : ''}">
  <div class="dropdown-wrapper">
    <select class="year-dropdown" bind:value={selectedAHN} on:change={yearClick} style="border: 2px solid {$configStore.mainColor};">
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
        style="border: 2px solid {$configStore.mainColor};"
      >
        {#if selectedDifference === "Difference"}
          <option value="Difference">Vergelijk jaren</option>
        {:else}
          <option value="Difference">Stop vergelijken</option>
        {/if}
        {#if options && options.length > 0}
          {#each options as option}
            {#if option && option.AHN && isLaterVersion(option.AHN)}
              <option value={option.AHN} selected={option.AHN === selectedDifference}>{option.Jaar}</option>
            {/if}
          {/each}
        {/if}
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
    color: var(--background-color);
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
    border: 2px solid var(--background-color);
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
    color: var(--background-color);
    margin: 0;
    user-select: none;
    line-height: 1;
  }
</style>
