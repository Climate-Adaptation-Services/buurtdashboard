<script>
  import { getIndicatorStore, selectedNeighbourhoodJSONData, neighbourhoodsInMunicipalityJSONData, configStore, municipalitySelection, allNeighbourhoodsJSONData } from "$lib/stores"
  import { isValidValue } from "$lib/utils/valueRetrieval.js"
  import { getIndicatorAttribute } from "$lib/utils/getIndicatorAttribute.js"

  export let indicator

  // Get the dedicated store for this specific indicator
  // Use dutchTitle for store key to ensure consistency across languages
  const indicatorStore = getIndicatorStore(indicator.dutchTitle || indicator.title)

  let options = []
  let selectedAHN = ''
  let selectedDifference = "Difference"

  // YearSwitch is never disabled - it works at Nederland, gemeente, and buurt levels
  $: isDisabled = false

  // Derived current selection from store
  $: currentSelection = $indicatorStore || { baseYear: '', compareYear: null, isDifference: false, beb: 'hele_buurt' }

  // Initialize local state from store when first loaded
  let hasLoadedFromStore = false
  $: if (!hasLoadedFromStore && currentSelection.baseYear) {
    selectedAHN = currentSelection.baseYear
    selectedDifference = currentSelection.isDifference ? currentSelection.compareYear : "Difference"
    hasLoadedFromStore = true
  }

  // Parse AHN versions from the indicator
  const ahnVersions = indicator.AHNversie.split(",")

  // Format years consistently - sort and use ranges for consecutive years
  function formatYears(yearsString) {
    if (!yearsString) return ""

    // Split by periods or commas, filter empty strings, sort numerically
    const years = yearsString
      .split(/[.,]\s*/)
      .filter((y) => y.trim())
      .map(y => parseInt(y))
      .sort((a, b) => a - b)
    
    return formatYearRanges(years)
  }

  // Helper function to format years as ranges (e.g., "2011-2014, 2016, 2018-2020")
  function formatYearRanges(years) {
    if (years.length === 0) return ""
    if (years.length === 1) return years[0].toString()

    const ranges = []
    let start = years[0]
    let end = years[0]

    for (let i = 1; i < years.length; i++) {
      if (years[i] === end + 1) {
        // Consecutive year, extend the range
        end = years[i]
      } else {
        // Gap found, close current range
        if (start === end) {
          ranges.push(start.toString())
        } else {
          ranges.push(`${start}-${end}`)
        }
        start = years[i]
        end = years[i]
      }
    }

    // Add the final range
    if (start === end) {
      ranges.push(start.toString())
    } else {
      ranges.push(`${start}-${end}`)
    }

    return ranges.join(", ")
  }

  // Helper function to check if a neighbourhood has valid data for a specific AHN version
  function hasValidDataForAHN(neighbourhoodData, ahn) {
    if (!neighbourhoodData?.properties) return false

    // For aggregated indicators, check if AT LEAST ONE class column has valid data
    if (indicator.aggregatedIndicator && indicator.classes) {
      return Object.values(indicator.classes).some(classAttr => {
        const attribute = getIndicatorAttribute(indicator, classAttr, ahn)
        const value = neighbourhoodData.properties[attribute]
        return isValidValue(value)
      })
    }

    // For regular indicators, check the main attribute
    const attribute = getIndicatorAttribute(indicator, indicator.attribute, ahn)
    const value = neighbourhoodData.properties[attribute]

    // Check if the value is valid (not -9991, -9995, -9999, null, etc.)
    return isValidValue(value)
  }

  // Update options when data changes, initialize store if needed
  $: {
    if ($selectedNeighbourhoodJSONData) {
      // For a selected neighborhood, only show AHN versions for which the buurt has valid data AND year data
      options = ahnVersions
        .filter((ahn) => {
          // Must have valid indicator data
          if (!hasValidDataForAHN($selectedNeighbourhoodJSONData, ahn)) return false
          // Must have valid year data (JaarAHN column must not be empty)
          const jaarData = $selectedNeighbourhoodJSONData.properties["Jaar" + ahn]
          return jaarData && jaarData.toString().trim() !== ''
        })
        .map((ahn) => {
          const jaarData = $selectedNeighbourhoodJSONData.properties["Jaar" + ahn];
          return {
            AHN: ahn,
            Jaar: formatYears(jaarData) // Year data is guaranteed to exist due to filter above
          };
        })
    } else if ($neighbourhoodsInMunicipalityJSONData) {
      findAHNyearsWithoutDuplicatesAndSort()
    } else if ($allNeighbourhoodsJSONData) {
      findAHNyearsForAllNetherlands()
    }

    // Initialize store with latest available year if no selection exists
    // OR update selection if current selection is no longer available in options
    if (options.length > 0) {
      const currentBaseYearAvailable = options.some(opt => opt.AHN === currentSelection.baseYear)
      const currentCompareYearAvailable = currentSelection.compareYear ? options.some(opt => opt.AHN === currentSelection.compareYear) : true

      if (!currentSelection.baseYear || !currentBaseYearAvailable) {
        // Select latest available year
        const latestOption = options[options.length - 1]
        indicatorStore.set({
          baseYear: latestOption.AHN,
          compareYear: null,
          isDifference: false,
          beb: currentSelection.beb || 'hele_buurt'
        })
        selectedAHN = latestOption.AHN
        selectedDifference = "Difference"
      } else if (currentSelection.isDifference && !currentCompareYearAvailable) {
        // Compare year no longer available, disable difference mode
        indicatorStore.set({
          baseYear: currentSelection.baseYear,
          compareYear: null,
          isDifference: false,
          beb: currentSelection.beb
        })
        selectedDifference = "Difference"
      }
    }
  }

  function findAHNyearsWithoutDuplicatesAndSort() {
    // For municipality view, collect all unique years
    // But only for AHN versions that have at least one neighbourhood with valid data AND year data
    options = ahnVersions.map((ahn) => ({ AHN: ahn, Jaar: [], hasValidData: false, hasYearData: false }))

    if (!$neighbourhoodsInMunicipalityJSONData?.features) return

    $neighbourhoodsInMunicipalityJSONData.features.forEach((nh) => {
      if (!nh?.properties) return // Skip null/invalid features
      ahnVersions.forEach((ahn) => {
        const option = options.find((j) => j.AHN === ahn)

        // Check if this neighbourhood has valid data for this AHN version
        if (!option.hasValidData && hasValidDataForAHN(nh, ahn)) {
          option.hasValidData = true
        }

        // Use the same splitting logic as in formatYears
        const yearData = nh.properties["Jaar" + ahn]
        if (yearData && yearData.toString().trim() !== '') {
          option.hasYearData = true
          const ahnYear = yearData.split(/[.,]\s*/)
          ahnYear
            .filter((y) => y.trim())
            .forEach((year) => {
              if (!option.Jaar.includes(year)) {
                option.Jaar.push(year)
              }
            })
        }
      })
    })

    // Sort years and format as ranges
    options.forEach((option) => {
      if (option.Jaar.length > 0) {
        const sortedYears = option.Jaar.map(y => parseInt(y)).sort((a, b) => a - b)
        option.Jaar = formatYearRanges(sortedYears)
      }
    })

    // Filter out AHN versions that have no valid data OR no year data
    options = options.filter(opt => opt.hasValidData && opt.hasYearData)
  }

  function findAHNyearsForAllNetherlands() {
    // For Nederland level, collect all unique years from all neighbourhoods
    // But only for AHN versions that have at least one neighbourhood with valid data AND year data
    options = ahnVersions.map((ahn) => ({ AHN: ahn, Jaar: [], hasValidData: false, hasYearData: false }))

    if (!$allNeighbourhoodsJSONData?.features) return

    $allNeighbourhoodsJSONData.features.forEach((nh) => {
      if (!nh?.properties) return // Skip null/invalid features
      ahnVersions.forEach((ahn) => {
        const option = options.find((j) => j.AHN === ahn)

        // Check if this neighbourhood has valid data for this AHN version
        if (!option.hasValidData && hasValidDataForAHN(nh, ahn)) {
          option.hasValidData = true
        }

        // Use the same splitting logic as in formatYears
        const yearData = nh.properties["Jaar" + ahn]
        if (yearData && yearData.toString().trim() !== '') {
          option.hasYearData = true
          const ahnYear = yearData.split(/[.,]\s*/)
          ahnYear
            .filter((y) => y.trim())
            .forEach((year) => {
              if (!option.Jaar.includes(year)) {
                option.Jaar.push(year)
              }
            })
        }
      })
    })

    // Sort years and format as ranges
    options.forEach((option) => {
      if (option.Jaar.length > 0) {
        const sortedYears = option.Jaar.map(y => parseInt(y)).sort((a, b) => a - b)
        option.Jaar = formatYearRanges(sortedYears)
      }
    })

    // Filter out AHN versions that have no valid data OR no year data
    options = options.filter(opt => opt.hasValidData && opt.hasYearData)
  }




  /**
   * Handle base year selection change
   */
  function yearClick(change) {
    const newAHN = change.target.value
    const isDifferenceMode = currentSelection.isDifference
    const compareYear = currentSelection.compareYear

    // If in difference mode and the new base year equals the current compare year,
    // find a different compare year or turn off difference mode
    let newCompareYear = compareYear
    let newIsDifference = isDifferenceMode
    let finalBaseYear = newAHN
    let finalCompareYear = newCompareYear

    if (isDifferenceMode && compareYear === newAHN) {
      const availableOption = options.find((option) => option.AHN !== newAHN)
      if (availableOption) {
        newCompareYear = availableOption.AHN
      } else {
        newIsDifference = false
        newCompareYear = null
      }
    }

    // If in difference mode, ensure chronological order
    if (isDifferenceMode && compareYear && newCompareYear) {
      const baseNum = parseInt(newAHN.replace(/\D/g, "") || "0", 10)
      const compareNum = parseInt(newCompareYear.replace(/\D/g, "") || "0", 10)

      if (baseNum > compareNum) {
        // Swap them if base year is later than compare year
        finalBaseYear = newCompareYear
        finalCompareYear = newAHN
      }
    }

    // Update local UI state to reflect any swapping
    selectedAHN = finalBaseYear
    if (newIsDifference) {
      selectedDifference = finalCompareYear
    } else {
      selectedDifference = "Difference"
    }

    // Update the store
    indicatorStore.set({
      baseYear: finalBaseYear,
      compareYear: finalCompareYear,
      isDifference: newIsDifference,
      beb: currentSelection.beb
    });
  }

  /**
   * Determine if an option should be shown in the difference dropdown
   * Shows all options except the one selected in the left dropdown
   */
  function shouldShowInDifferenceDropdown(optionAHN, index) {
    try {
      if (!optionAHN) return false

      // Show all options except the one selected in the left dropdown
      return optionAHN !== selectedAHN
    } catch (e) {
      console.error("Error evaluating dropdown options:", e)
      return false
    }
  }

  /**
   * Determine if an option should be shown in the main (left) dropdown
   * Shows all options except the one selected in the right dropdown (when in difference mode)
   */
  function shouldShowInMainDropdown(optionAHN, index) {
    try {
      if (!optionAHN) return false

      // If not in difference mode, show all options
      if (selectedDifference === "Difference") return true

      // Show all options except the one selected in the right dropdown
      return optionAHN !== selectedDifference
    } catch (e) {
      console.error("Error evaluating main dropdown options:", e)
      return false
    }
  }

  /**
   * Handle difference year selection change
   */
  function yearClickDifference(change) {
    const differenceAHN = change.target.value

    if (differenceAHN === "Difference") {
      // Turn off difference mode
      indicatorStore.set({
        baseYear: currentSelection.baseYear,
        compareYear: null,
        isDifference: false,
        beb: currentSelection.beb
      })
      selectedDifference = "Difference"
    } else {
      // Extract numeric parts for comparison to ensure proper chronological order
      const compareNum = parseInt(differenceAHN.replace(/\D/g, "") || "0", 10)
      const baseNum = parseInt(currentSelection.baseYear.replace(/\D/g, "") || "0", 10)

      // Always ensure base year is earlier and compare year is later
      const [newBaseYear, newCompareYear] = compareNum < baseNum
        ? [differenceAHN, currentSelection.baseYear]
        : [currentSelection.baseYear, differenceAHN]

      // Update local UI state to reflect the swap
      selectedAHN = newBaseYear
      selectedDifference = newCompareYear

      // Update the store
      indicatorStore.set({
        baseYear: newBaseYear,
        compareYear: newCompareYear,
        isDifference: true,
        beb: currentSelection.beb
      })
    }
  }
</script>

<!-- Replacing SVG year switch with two dropdowns -->
<div class="year-switch-dropdowns {selectedDifference === 'Difference' ? 'less-gap' : ''}">
  <div class="dropdown-wrapper">
    <select class="year-dropdown {isDisabled ? 'disabled' : ''}" bind:value={selectedAHN} on:change={yearClick} style="border: 2px solid {$configStore.mainColor};" disabled={isDisabled}>
      {#each options as option, index}
        {#if shouldShowInMainDropdown(option.AHN, index)}
          <option value={option.AHN} selected={option.AHN == selectedAHN}>{option.Jaar}</option>
        {/if}
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
        class="year-dropdown {selectedDifference === 'Difference' ? 'pseudo-disabled' : ''} {isDisabled ? 'disabled' : ''}"
        bind:value={selectedDifference}
        on:change={yearClickDifference}
        style="border: 2px solid {$configStore.mainColor};"
        disabled={isDisabled}
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
    z-index: 10; /* Ensure dropdown appears above indicator body */
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
    position: relative;
    z-index: 10; /* Ensure dropdown container appears above indicator body */
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
  .disabled {
    background: #f2f2f2 !important;
    color: #8d8d8d !important;
    cursor: not-allowed !important;
    opacity: 0.6 !important;
  }
  .arrow-between {
    font-size: 28px;
    color: var(--background-color);
    margin: 0;
    user-select: none;
    line-height: 1;
  }
</style>
