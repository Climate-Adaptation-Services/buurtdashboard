<script>
  import { indicatorsSelection, URLParams, monitoringOverTijdActive, gebiedsselectieActive, globalBEBSelection } from "$lib/stores"
  import { addURLParameter, removeURLParameter } from "$lib/services/urlManager"
  import { t } from "$lib/i18n/translate.js"

  export let allIndicators

  const categories = ['Effecten', 'Gebiedskenmerken', 'Kwetsbaarheid']

  let searchText = ''
  let isOpen = false
  let dropdownRef

  // Tooltip state
  let hoveredTooltip = null
  let tooltipPosition = { x: 0, y: 0 }

  function showTooltip(event, tooltipId) {
    hoveredTooltip = tooltipId
    const rect = event.target.getBoundingClientRect()

    // For bebouwde_kom, center horizontally above the sidepanel (use parent container width)
    if (tooltipId === 'bebouwde_kom') {
      const sidepanel = event.target.closest('.custom-multiselect')
      if (sidepanel) {
        const sidepanelRect = sidepanel.getBoundingClientRect()
        tooltipPosition = {
          x: sidepanelRect.left + sidepanelRect.width / 2,
          y: rect.top - 10
        }
        return
      }
    }

    tooltipPosition = {
      x: rect.left + rect.width / 2,
      y: rect.top - 10
    }
  }

  function hideTooltip() {
    hoveredTooltip = null
  }

  // Indicators with year/AHN variants
  $: indicatorsWithYears = allIndicators.filter(ind => ind.AHNversie && ind.AHNversie.length > 0)

  // Indicators with BEB variants (any variant that's not M2 or empty)
  $: indicatorsWithBEB = allIndicators.filter(ind =>
    ind.variants && ind.variants.split(",").map(v => v.trim()).some(v => v !== 'M2' && v !== '')
  )

  // Filter indicators based on active global filters
  $: filteredByGlobalFilters = allIndicators.filter(ind => {
    // If no filters active, show all
    if (!$monitoringOverTijdActive && !$gebiedsselectieActive) return true

    let passesFilter = true

    // If monitoring filter active, indicator must have year variants
    if ($monitoringOverTijdActive) {
      passesFilter = passesFilter && ind.AHNversie && ind.AHNversie.length > 0
    }

    // If gebiedsselectie filter active, indicator must have BEB variants
    if ($gebiedsselectieActive) {
      const hasBEB = ind.variants && ind.variants.split(",").map(v => v.trim()).some(v => v !== 'M2' && v !== '')
      passesFilter = passesFilter && hasBEB
    }

    return passesFilter
  })

  // Track previous filter states to detect changes
  let prevMonitoringActive = false
  let prevGebiedsselectieActive = false
  let prevBEBSelection = 'hele_buurt'

  // Auto-select filtered indicators when a filter is activated or BEB changes
  $: {
    const monitoringJustActivated = $monitoringOverTijdActive && !prevMonitoringActive
    const gebiedsselectieJustActivated = $gebiedsselectieActive && !prevGebiedsselectieActive
    const monitoringJustDeactivated = !$monitoringOverTijdActive && prevMonitoringActive
    const gebiedsselectieJustDeactivated = !$gebiedsselectieActive && prevGebiedsselectieActive
    const bebJustChangedToBebouwdeKom = $globalBEBSelection === 'bebouwde_kom' && prevBEBSelection === 'hele_buurt'

    // When a filter is activated OR BEB is set to bebouwde_kom, select all matching indicators
    if (monitoringJustActivated || gebiedsselectieJustActivated || bebJustChangedToBebouwdeKom) {
      // When BEB changes to bebouwde_kom, filter to only indicators with BEB variants
      let titlesToSelect
      if (bebJustChangedToBebouwdeKom) {
        titlesToSelect = indicatorsWithBEB.map(ind => ind.title)
      } else {
        titlesToSelect = filteredByGlobalFilters.map(ind => ind.title)
      }
      $indicatorsSelection = titlesToSelect

      // Update URL params
      const newParams = new URLSearchParams($URLParams)
      newParams.delete("indicator")
      titlesToSelect.forEach(title => newParams.append("indicator", title))
      $URLParams = newParams
      addURLParameter()
    }

    // When both filters are deactivated, clear selection (but NOT when BEB changes to hele_buurt)
    if ((monitoringJustDeactivated || gebiedsselectieJustDeactivated) &&
        !$monitoringOverTijdActive && !$gebiedsselectieActive) {
      $indicatorsSelection = []
      const newParams = new URLSearchParams($URLParams)
      newParams.delete("indicator")
      $URLParams = newParams
      removeURLParameter()
    }

    // Update previous states
    prevMonitoringActive = $monitoringOverTijdActive
    prevGebiedsselectieActive = $gebiedsselectieActive
    prevBEBSelection = $globalBEBSelection
  }

  // Group filtered indicators by category
  $: indicatorsByCategory = categories.map(category => ({
    category,
    indicators: filteredByGlobalFilters.filter(ind => ind.category === category)
  }))

  // Filter indicators based on search and exclude already selected ones
  $: filteredCategories = indicatorsByCategory.map(cat => ({
    ...cat,
    indicators: cat.indicators.filter(ind =>
      !$indicatorsSelection.includes(ind.title) &&
      ind.title.toLowerCase().includes(searchText.toLowerCase())
    )
  })).filter(cat => cat.indicators.length > 0)

  // Always show category headers
  $: showCategoryHeaders = true

  function selectIndicator(title) {
    // Find the indicator object
    const indicator = allIndicators.find(ind => ind.title === title)

    // Check if indicator fits the active filters, if not - deactivate the filters
    if (indicator) {
      // Check monitoring filter
      if ($monitoringOverTijdActive) {
        const hasYears = indicator.AHNversie && indicator.AHNversie.length > 0
        if (!hasYears) {
          $monitoringOverTijdActive = false
        }
      }

      // Check gebiedsselectie filter
      if ($gebiedsselectieActive) {
        const hasBEB = indicator.variants && indicator.variants.split(",").map(v => v.trim()).some(v => v !== 'M2' && v !== '')
        if (!hasBEB) {
          $gebiedsselectieActive = false
        }
      }

      // Check BEB selection - if indicator doesn't have BEB variant and bebouwde_kom is selected, switch to hele_buurt
      if ($globalBEBSelection === 'bebouwde_kom') {
        const hasBEB = indicator.variants && indicator.variants.split(",").map(v => v.trim()).some(v => v !== 'M2' && v !== '')
        if (!hasBEB) {
          $globalBEBSelection = 'hele_buurt'
        }
      }
    }

    // Add to indicatorsSelection store
    $indicatorsSelection = [...$indicatorsSelection, title]

    // Update URL params
    const newParams = new URLSearchParams($URLParams)
    newParams.append("indicator", title)
    $URLParams = newParams
    addURLParameter()

    // Clear search and keep dropdown open
    searchText = ''
  }

  function removeIndicator(title) {
    // Remove from indicatorsSelection store
    $indicatorsSelection = $indicatorsSelection.filter(i => i !== title)

    // Update URL params
    const newParams = new URLSearchParams($URLParams)
    const currentIndicators = newParams.getAll("indicator")
    newParams.delete("indicator")
    currentIndicators.forEach(indicator => {
      if (indicator !== title) {
        newParams.append("indicator", indicator)
      }
    })
    $URLParams = newParams
    removeURLParameter()
  }

  function clearAll() {
    // Clear indicatorsSelection store
    $indicatorsSelection = []

    // Deactivate filter toggles
    $monitoringOverTijdActive = false
    $gebiedsselectieActive = false

    // Reset BEB selection to hele_buurt
    $globalBEBSelection = 'hele_buurt'

    // Update URL params
    const newParams = new URLSearchParams($URLParams)
    newParams.delete("indicator")
    $URLParams = newParams
    removeURLParameter()
  }

  // Close dropdown when clicking outside
  function handleClickOutside(event) {
    if (dropdownRef && !dropdownRef.contains(event.target)) {
      isOpen = false
    }
  }
</script>

<svelte:window on:click={handleClickOutside} />

{#if allIndicators && allIndicators.length > 0}
<div class="custom-multiselect" bind:this={dropdownRef}>
  <!-- BEB selection - always visible above filter section -->
  <div class="beb-selection">
    <label
      class="beb-toggle"
      class:active={$globalBEBSelection === 'hele_buurt'}
    >
      <input type="radio" bind:group={$globalBEBSelection} value="hele_buurt" />
      {t("Hele buurt")}
    </label>
    <label
      class="beb-toggle"
      class:active={$globalBEBSelection === 'bebouwde_kom'}
      on:mouseenter={(e) => showTooltip(e, 'bebouwde_kom')}
      on:mouseleave={hideTooltip}
    >
      <input type="radio" bind:group={$globalBEBSelection} value="bebouwde_kom" />
      {t("Bebouwde kom")}
    </label>
  </div>

  <p style="margin-bottom:5px">{`Filter ${t("indicatoren")}:`}</p>

  <!-- Global filter toggles -->
  <div class="global-filters">
    <button
      class="filter-toggle"
      class:active={$monitoringOverTijdActive}
      on:click={() => $monitoringOverTijdActive = !$monitoringOverTijdActive}
      on:mouseenter={(e) => showTooltip(e, 'monitoring')}
      on:mouseleave={hideTooltip}
    >
      {t("Monitoring over tijd")}
    </button>
  </div>

  <!-- Custom tooltips - rendered at document level for proper z-index -->
  {#if hoveredTooltip}
    <div class="custom-tooltip" style="left: {tooltipPosition.x}px; top: {tooltipPosition.y}px;">
      {#if hoveredTooltip === 'bebouwde_kom'}
        {t("tooltip_bebouwde_kom")}
      {:else if hoveredTooltip === 'monitoring'}
        {t("tooltip_monitoring")}
      {/if}
    </div>
  {/if}

  <!-- Divider between filters and indicator selection -->
  {#if $monitoringOverTijdActive}
    <div class="divider"></div>
  {/if}

  <!-- Input area with selected tags -->
  <div class="input-container" on:click={() => isOpen = true}>
    {#each $indicatorsSelection as selected}
      <span class="tag">
        {selected}
        <button on:click|stopPropagation={() => removeIndicator(selected)}>×</button>
      </span>
    {/each}
    <input
      type="text"
      placeholder={$indicatorsSelection.length === 0 ? "Zoek indicatoren..." : ""}
      bind:value={searchText}
      on:focus={() => isOpen = true}
      on:click|stopPropagation
    />
    {#if $indicatorsSelection.length > 0}
      <button class="clear-all-btn" on:click|stopPropagation={clearAll}>×</button>
    {/if}
  </div>

  <!-- Dropdown menu -->
  {#if isOpen}
    <div class="dropdown-menu">
      {#each filteredCategories as { category, indicators }}
        {#if showCategoryHeaders}
          <div class="category-header">{category}</div>
        {/if}
        {#each indicators as indicator}
          <div class="indicator-item" on:click={() => selectIndicator(indicator.title)}>
            {indicator.title}
          </div>
        {/each}
      {/each}
      {#if filteredCategories.length === 0}
        <div class="no-results">No indicators found</div>
      {/if}
    </div>
  {/if}
</div>
{/if}

<style>
  .custom-multiselect {
    width: 330px;
    color: white;
    font-size: 12px;
    position: relative;
    margin-top: 16px;
  }

  .input-container {
    background: #36575a;
    border: 2px solid white;
    border-radius: 8px;
    padding: 4px;
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    align-items: flex-start;
    min-height: 34px;
    cursor: text;
    position: relative;
  }

  .tag {
    background: #36575a;
    color: white;
    padding: 2px 6px;
    border-radius: 3px;
    font-size: 11px;
    display: inline-flex;
    align-items: center;
    gap: 4px;
    white-space: nowrap;
    border: 1px solid white;
  }

  .tag button {
    background: none;
    border: none;
    color: white;
    cursor: pointer;
    font-size: 14px;
    padding: 0;
    line-height: 1;
    font-weight: bold;
  }

  .tag button:hover {
    opacity: 0.8;
  }

  .input-container input {
    flex: 1;
    min-width: 80px;
    border: none;
    outline: none;
    font-size: 12px;
    padding: 4px;
    padding-right: 70px;
    color: white;
    background: transparent;
  }

  .input-container input::placeholder {
    color: rgba(255, 255, 255, 0.6);
  }

  .clear-all-btn {
    background: none;
    color: white;
    border: none;
    cursor: pointer;
    font-size: 22px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0;
    line-height: 1;
    position: absolute;
    top: 1px;
    right: 4px;
    font-weight: bold;
  }

  .clear-all-btn:hover {
    opacity: 0.7;
  }

  .dropdown-menu {
    position: absolute;
    top: 100%;
    left: 0;
    width: 100%;
    max-height: 300px;
    overflow-y: auto;
    background: white;
    border: 1px solid #ccc;
    border-radius: 4px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    z-index: 1000;
    margin-top: 2px;
  }

  .category-header {
    color: steelblue;
    background-color: #e5e3e3;
    text-align: center;
    padding: 8px;
    font-weight: normal;
    cursor: default;
  }

  .indicator-item {
    padding: 8px 12px;
    cursor: pointer;
    color: black;
    background-color: white;
  }

  .indicator-item:hover {
    background-color: #f0f0f0;
  }

  .no-results {
    padding: 12px;
    text-align: center;
    color: #999;
  }

  .global-filters {
    display: flex;
    gap: 8px;
    margin-bottom: 8px;
  }

  .filter-toggle {
    flex: 1;
    background: transparent;
    color: white;
    border: 1px solid white;
    border-radius: 4px;
    padding: 6px 10px;
    font-size: 11px;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .filter-toggle:hover {
    background: rgba(255, 255, 255, 0.1);
  }

  .filter-toggle.active {
    background: white;
    color: #36575a;
    font-weight: 500;
  }

  .beb-selection {
    display: flex;
    gap: 8px;
    margin-bottom: 12px;
  }

  .beb-toggle {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    background: transparent;
    color: white;
    border: 1px solid white;
    border-radius: 4px;
    padding: 6px 10px;
    font-size: 11px;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .beb-toggle input[type="radio"] {
    display: none;
  }

  .beb-toggle:hover {
    background: rgba(255, 255, 255, 0.1);
  }

  .beb-toggle.active {
    background: white;
    color: #36575a;
    font-weight: 500;
  }

  .global-selection select {
    background: white;
    color: #36575a;
    border: none;
    border-radius: 3px;
    padding: 3px 6px;
    font-size: 11px;
  }

  .global-selection input[type="checkbox"],
  .global-selection input[type="radio"] {
    margin: 0;
  }

  .divider {
    height: 1px;
    background: rgba(255, 255, 255, 0.3);
    margin: 12px 0;
  }

  .custom-tooltip {
    position: fixed;
    background-color: white;
    color: #333;
    padding: 15px 20px;
    border-radius: 10px;
    font-size: 12px;
    line-height: 1.5;
    max-width: 300px;
    text-align: left;
    transform: translate(-50%, -100%);
    z-index: 99999;
    pointer-events: none;
    box-shadow:
      rgba(0, 0, 0, 0.3) 0px 19px 38px,
      rgba(0, 0, 0, 0.22) 0px 15px 12px;
  }

</style>
