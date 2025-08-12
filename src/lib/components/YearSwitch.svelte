<script>
  import { getIndicatorStore, selectedNeighbourhoodJSONData, neighbourhoodsInMunicipalityJSONData, configStore } from "$lib/stores"

  export let indicator

  // Get the dedicated store for this specific indicator
  const indicatorStore = getIndicatorStore(indicator.title)

  let options = []
  let selectedAHN
  let selectedDifference = "Difference"

  // Parse AHN versions from the indicator
  const ahnVersions = indicator.AHNversie.split(",")

  // Format years consistently - sort and use commas instead of periods
  function formatYears(yearsString) {
    if (!yearsString) return ""

    // Split by periods or commas, filter empty strings, sort numerically, join with commas
    return yearsString
      .split(/[.,]\s*/)
      .filter((y) => y.trim())
      .sort((a, b) => a - b)
      .join(", ")
  }

  // Reactive statement to update options when data changes
  $: {
    if ($selectedNeighbourhoodJSONData) {
      // For a selected neighborhood, get years and format them consistently
      options = ahnVersions.map((ahn) => ({
        AHN: ahn,
        Jaar: formatYears($selectedNeighbourhoodJSONData.properties["Jaar" + ahn]),
      }))
    } else if ($neighbourhoodsInMunicipalityJSONData) {
      findAHNyearsWithoutDuplicatesAndSort()
    }
  }

  function findAHNyearsWithoutDuplicatesAndSort() {
    // For municipality view, collect all unique years
    options = ahnVersions.map((ahn) => ({ AHN: ahn, Jaar: [] }))

    $neighbourhoodsInMunicipalityJSONData.features.forEach((nh) => {
      ahnVersions.forEach((ahn) => {
        // Use the same splitting logic as in formatYears
        const ahnYear = nh.properties["Jaar" + ahn].split(/[.,]\s*/)
        ahnYear
          .filter((y) => y.trim())
          .forEach((year) => {
            if (!options.find((j) => j.AHN === ahn).Jaar.includes(year)) {
              options.find((j) => j.AHN === ahn).Jaar.push(year)
            }
          })
      })
    })

    // Sort years and convert to comma-separated string
    options.forEach((option) => {
      option.Jaar.sort((a, b) => a - b)
      option.Jaar = option.Jaar.join(", ")
    })
  }

  // Helper function to update local state from AHNSelecties
  function updateFromSelection(currentSelection) {
    if (currentSelection) {
      if (typeof currentSelection === "object") {
        // Use the object structure
        selectedAHN = currentSelection.baseYear
        selectedDifference = currentSelection.isDifference ? currentSelection.compareYear : "Difference"
      } else {
        // Legacy format - convert to object structure on next update
        selectedAHN = currentSelection
        selectedDifference = "Difference"
      }
    }
  }

  // React to indicator store changes - much cleaner!
  $: {
    updateFromSelection($indicatorStore)
  }

  // Update selected AHN when neighborhood data changes
  $: if ($selectedNeighbourhoodJSONData) {
    updateFromSelection($indicatorStore)
  }

  /**
   * Helper function to get or create a selection object
   */
  function getSelectionObject(selection) {
    if (!selection) {
      return {
        baseYear: options.length > 0 ? options[0].AHN : null,
        compareYear: null,
        isDifference: false,
      }
    }

    if (typeof selection === "object") {
      return selection
    }

    // Convert string to object
    return {
      baseYear: selection,
      compareYear: null,
      isDifference: false,
    }
  }

  /**
   * Handle base year selection change
   */
  function yearClick(change) {
    const newAHN = change.target.value


    // Get current selection as an object
    const selectionObj = getSelectionObject($indicatorStore)
    const isDifferenceMode = selectionObj.isDifference
    const compareYear = selectionObj.compareYear || null

    // FIXED: Update with new base year using proper store update
    let updatedSelection = {
      baseYear: newAHN,
      compareYear: compareYear,
      isDifference: isDifferenceMode
    }

    // If the new base year is >= compare year or compareYear is null, find a new valid compare year
    const baseNum = parseInt(newAHN.replace(/\D/g, "") || "0", 10)
    const compareNum = compareYear ? parseInt(compareYear.replace(/\D/g, "") || "0", 10) : 0

    if (compareYear === null || baseNum >= compareNum) {
      // Find the next available year after the new base year
      const nextOption = options.find((option) => {
        if (!option || !option.AHN) return false
        const optionNum = parseInt(option.AHN.replace(/\D/g, "") || "0", 10)
        return optionNum > baseNum
      })

      if (nextOption) {
        // Update compare year in the local object
        updatedSelection.compareYear = nextOption.AHN
        selectedDifference = nextOption.AHN
      } else {
        // No valid compare year available, revert to regular mode
        updatedSelection.isDifference = false
        updatedSelection.compareYear = null
        selectedDifference = "Difference"
      }
    } else {
      // Keep the current compare year
      selectedDifference = compareYear
    }

    // FIXED: Single store update with the final selection object
    // Much simpler with dedicated store!
    indicatorStore.set(updatedSelection)

    // selectedAHN = newAHN
  }

  /**
   * Determine if an option should be shown in the difference dropdown
   * Only shows years later than the selected base year
   */
  function shouldShowInDifferenceDropdown(optionAHN, index) {
    try {
      if (!optionAHN) return false

      // Get the index of this option in the options array
      const optionIndex = options.findIndex((opt) => opt.AHN === optionAHN)

      // Show all options except the first one
      return optionIndex > 0
    } catch (e) {
      console.error("Error evaluating dropdown options:", e)
      return false
    }
  }

  /**
   * Handle difference year selection change
   */
  function yearClickDifference(change) {
    const differenceAHN = change.target.value

    // Get current selection as an object
    const selectionObj = getSelectionObject($indicatorStore)

    let updatedSelection
    
    if (differenceAHN === "Difference") {
      // Turn off difference mode but keep the object structure
      updatedSelection = {
        baseYear: selectionObj.baseYear,
        compareYear: null,
        isDifference: false
      }
      selectedDifference = "Difference"
    } else {
      // Extract numeric parts for comparison
      const compareNum = parseInt(differenceAHN.replace(/\D/g, "") || "0", 10)
      const baseNum = parseInt(selectionObj.baseYear.replace(/\D/g, "") || "0", 10)

      let newBaseYear = selectionObj.baseYear

      // If compareYear is earlier or the same as baseYear
      if (compareNum <= baseNum) {
        // Find the AHN before the compareYear
        const sortedOptions = [...options].sort((a, b) => {
          const aNum = parseInt(a.AHN.replace(/\D/g, "") || "0", 10)
          const bNum = parseInt(b.AHN.replace(/\D/g, "") || "0", 10)
          return aNum - bNum
        })

        // Find the index of the compareYear
        const compareIndex = sortedOptions.findIndex((opt) => opt.AHN === differenceAHN)

        // If it's not the first option, set baseYear to the previous option
        if (compareIndex > 0) {
          newBaseYear = sortedOptions[compareIndex - 1].AHN
        }
      }

      // Store both years for difference calculation
      updatedSelection = {
        baseYear: newBaseYear,
        compareYear: differenceAHN,
        isDifference: true
      }
      selectedDifference = differenceAHN
      selectedAHN = newBaseYear
    }

    // Much simpler with dedicated store!
    indicatorStore.set(updatedSelection)
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
          {#each options as option, index}
            {#if option && option.AHN && shouldShowInDifferenceDropdown(option.AHN, index)}
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
