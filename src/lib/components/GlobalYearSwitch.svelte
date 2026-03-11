<script>
  import { globalYearSelection, configStore, allNeighbourhoodsJSONData, alleIndicatoren } from "$lib/stores"
  import { isValidValue } from "$lib/utils/valueRetrieval.js"
  import { getIndicatorAttribute } from "$lib/utils/getIndicatorAttribute.js"

  // Get all available AHN versions from all indicators with year variants
  $: indicatorsWithYears = $alleIndicatoren.filter(ind => ind.AHNversie && ind.AHNversie.length > 0)

  // Hardcoded year mappings for AHN versions
  const ahnYearMapping = {
    'AHN2': '2009',
    'AHN3': '2019',
    'AHN4': '2022',
    'AHN5': '2025'
  }

  // Helper function to format years as ranges
  function formatYearRanges(years) {
    if (years.length === 0) return ""
    if (years.length === 1) return years[0].toString()

    const ranges = []
    let start = years[0]
    let end = years[0]

    for (let i = 1; i < years.length; i++) {
      if (years[i] === end + 1) {
        end = years[i]
      } else {
        if (start === end) {
          ranges.push(start.toString())
        } else {
          ranges.push(`${start}-${end}`)
        }
        start = years[i]
        end = years[i]
      }
    }

    if (start === end) {
      ranges.push(start.toString())
    } else {
      ranges.push(`${start}-${end}`)
    }

    return ranges.join(", ")
  }

  // Build options from all available AHN versions across indicators
  let options = []
  $: {
    const allAHNVersions = new Set()
    indicatorsWithYears.forEach(ind => {
      if (ind.AHNversie) {
        ind.AHNversie.split(',').map(v => v.trim()).forEach(ahn => allAHNVersions.add(ahn))
      }
    })

    // Convert to array and build options with year labels
    options = Array.from(allAHNVersions).sort().map(ahn => {
      // Try to find year data from neighborhoods
      let yearData = null
      if ($allNeighbourhoodsJSONData?.features) {
        for (const nh of $allNeighbourhoodsJSONData.features) {
          if (nh?.properties?.["Jaar" + ahn]) {
            yearData = nh.properties["Jaar" + ahn]
            break
          }
        }
      }

      let displayYear
      if (yearData) {
        const years = yearData.split(/[.,]\s*/).filter(y => y.trim()).map(y => parseInt(y)).sort((a, b) => a - b)
        displayYear = formatYearRanges(years)
      } else {
        displayYear = ahnYearMapping[ahn] || ahn
      }

      return { AHN: ahn, Jaar: displayYear }
    })

    // Initialize global year selection if empty and options available
    if (options.length > 0 && !$globalYearSelection.baseYear) {
      $globalYearSelection = { ...$globalYearSelection, baseYear: options[options.length - 1].AHN }
    }
  }

  // Local state for UI
  $: selectedAHN = $globalYearSelection.baseYear || ''
  $: selectedDifference = $globalYearSelection.isDifference ? $globalYearSelection.compareYear : "Difference"

  function shouldShowInMainDropdown(optionAHN) {
    if (!optionAHN) return false
    if (selectedDifference === "Difference") return true
    return optionAHN !== selectedDifference
  }

  function shouldShowInDifferenceDropdown(optionAHN) {
    if (!optionAHN) return false
    return optionAHN !== selectedAHN
  }

  function yearClick(change) {
    const newAHN = change.target.value
    const isDifferenceMode = $globalYearSelection.isDifference
    const compareYear = $globalYearSelection.compareYear

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

    if (isDifferenceMode && compareYear && newCompareYear) {
      const baseNum = parseInt(newAHN.replace(/\D/g, "") || "0", 10)
      const compareNum = parseInt(newCompareYear.replace(/\D/g, "") || "0", 10)

      if (baseNum > compareNum) {
        finalBaseYear = newCompareYear
        finalCompareYear = newAHN
      }
    }

    $globalYearSelection = {
      baseYear: finalBaseYear,
      compareYear: finalCompareYear,
      isDifference: newIsDifference
    }
  }

  function yearClickDifference(change) {
    const differenceAHN = change.target.value

    if (differenceAHN === "Difference") {
      $globalYearSelection = {
        baseYear: $globalYearSelection.baseYear,
        compareYear: null,
        isDifference: false
      }
    } else {
      const compareNum = parseInt(differenceAHN.replace(/\D/g, "") || "0", 10)
      const baseNum = parseInt($globalYearSelection.baseYear.replace(/\D/g, "") || "0", 10)

      const [newBaseYear, newCompareYear] = compareNum < baseNum
        ? [differenceAHN, $globalYearSelection.baseYear]
        : [$globalYearSelection.baseYear, differenceAHN]

      $globalYearSelection = {
        baseYear: newBaseYear,
        compareYear: newCompareYear,
        isDifference: true
      }
    }
  }
</script>

{#if options.length > 0}
<div class="year-switch-dropdowns {selectedDifference === 'Difference' ? 'less-gap' : ''}">
  <div class="dropdown-wrapper">
    <select class="year-dropdown" bind:value={selectedAHN} on:change={yearClick} style="border: 2px solid {$configStore.mainColor};">
      {#each options as option}
        {#if shouldShowInMainDropdown(option.AHN)}
          <option value={option.AHN} selected={option.AHN == selectedAHN}>{option.Jaar}</option>
        {/if}
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
          {#if option && option.AHN && shouldShowInDifferenceDropdown(option.AHN)}
            <option value={option.AHN} selected={option.AHN === selectedDifference}>{option.Jaar}</option>
          {/if}
        {/each}
      {/if}
    </select>
    {#if selectedDifference !== "Difference"}
      <span class="dropdown-arrow">&#9662;</span>
    {/if}
  </div>
</div>
{/if}

<style>
  .dropdown-wrapper {
    position: relative;
    display: inline-block;
    width: 150px;
    z-index: 10;
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
    margin-bottom: 12px;
    align-items: center;
    position: relative;
    z-index: 10;
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
    color: white;
    margin: 0;
    user-select: none;
    line-height: 1;
  }
</style>
